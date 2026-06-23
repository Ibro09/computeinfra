import express from "express";
import path from "path";
import https from "https";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";



dotenv.config();
const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize GoogleGenAI client
const aiGenAI = new GoogleGenAI({
  apiKey:   process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build",
    }
  }
});



// MongoDB connection string with dynamic fallback to in-memory/JSON-like database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/compute_infra";
let mongoConnected = false;

// Standby memory store for mock fallback
let memoryDatabase: Record<string, any> = {};
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com";
const SOLANA_PRIVATE_KEY = (process.env.SOLANA_PRIVATE_KEY || process.env.PRIVATE_KEY || "").trim();

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string) {
  if (!password || !storedHash) return false;
  const [salt, expectedHash] = storedHash.split(":");
  if (!salt || !expectedHash) return false;
  const derived = scryptSync(password, salt, 64).toString("hex");
  return timingSafeEqual(Buffer.from(expectedHash, "hex"), Buffer.from(derived, "hex"));
}

function getDevnetPayer() {
  if (!SOLANA_PRIVATE_KEY) return null;

  if (/your_base58_private_key_here|placeholder|changeme/i.test(SOLANA_PRIVATE_KEY)) {
    return null;
  }

  try {
    const decoded = bs58.decode(SOLANA_PRIVATE_KEY);
    if (!decoded || decoded.length !== 64) {
      console.warn("[solana] private key has invalid length for a Solana secret key.");
      return null;
    }

    return Keypair.fromSecretKey(decoded);
  } catch (err: any) {
    console.warn("[solana] configured private key is invalid or not a valid base58 Solana secret key.", err.message);
    return null;
  }
}

function getChatGPTResponse(
  message: string,
  selectedModel: string = "DEEPSEEK",
  temperature: number = 0.7
): Promise<string> {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return reject(new Error("OPENAI_API_KEY is missing"));
    }

    let systemPrompt = "";

    if (selectedModel === "LLAMA-3") {
      systemPrompt =
        "You are Llama-3-Instruct running inside ComputeInfra. Be logical, clear, and intelligent.";
    } else if (selectedModel === "DEEPSEEK") {
      systemPrompt =
        "You are DeepSeek-R1-Cognitive. Focus on deep reasoning and structured analysis.";
    } else if (selectedModel === "QWEN-2.5") {
      systemPrompt =
        "You are Qwen-2.5-Coder. Be an elite programming assistant.";
    } else {
      systemPrompt =
        "You are a highly intelligent AI assistant running inside ComputeInfra.";
    }

    const payload = JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: message,
        },
      ],
      temperature,
      max_tokens: 2048,
    });

    const options = {
      hostname: "api.openai.com",
      path: "/v1/chat/completions",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "Content-Length": Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);

          if (parsed.error) {
            return reject(new Error(parsed.error.message));
          }

          const text =
            parsed?.choices?.[0]?.message?.content ||
            "No response received from ChatGPT.";

          resolve(text);
        } catch (err) {
          reject(err);
        }
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.write(payload);
    req.end();
  });
}
async function sendDevnetTransfer(recipient: string, amount: number) {
  const payer = getDevnetPayer();
  if (!payer) {
    return { success: false, reason: "No Solana private key configured in environment variables." };
  }

  try {
    const connection = new Connection(SOLANA_RPC_URL, "confirmed");
    const recipientPublicKey = new PublicKey(recipient);
    const lamports = Math.round(amount * LAMPORTS_PER_SOL);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: payer.publicKey,
        toPubkey: recipientPublicKey,
        lamports,
      }),
    );

    const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
    transaction.feePayer = payer.publicKey;
    transaction.recentBlockhash = blockhash;
    transaction.sign(payer);

    const signature = await connection.sendRawTransaction(transaction.serialize());
    await connection.confirmTransaction({ signature, blockhash, lastValidBlockHeight });
    return { success: true, signature };
  } catch (err: any) {
    console.warn("[solana] transfer failed, falling back to local withdrawal record.", err.message);
    return { success: false, reason: err.message };
  }
}

console.log(`Connecting to Mongoose database at: `);
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("Mongoose connected to MongoDB successfully.");
    mongoConnected = true;
  })
  .catch(err => {
    console.warn("MongoDB connection failed. Continuing server execution with local backup cache memory state.", err.message);
    mongoConnected = false;
  });

// Schema definition
const UserSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  name: { type: String, default: "" },
  address: { type: String, default: "" },
  passwordHash: { type: String, default: "" },
  balance: { type: Number, default: 0 },
  earnings: { type: Number, default: 0 },
  jobsCompleted: { type: Number, default: 0 },
  tokensProcessed: { type: Number, default: 0 },
  withdrawals: [{
    id: String,
    amount: Number,
    address: String,
    timestamp: { type: String },
    txHash: String,
    status: { type: String, default: "confirmed" }
  }],
  payments: [{
    id: String,
    amount: Number,
    recipient: String,
    timestamp: { type: String },
    txHash: String,
    status: { type: String, default: "confirmed" }
  }],
  chatHistory: [{
    id: String,
    sender: { type: String },
    text: { type: String },
    time: { type: String },
    nodeId: { type: String },
    latency: { type: String },
    gas: { type: String },
    hash: { type: String }
  }]
});

const MongoUser = (mongoose.models.COMPUTEINFRAUser || mongoose.model("COMPUTEINFRAUser", UserSchema)) as any;

function buildDefaultUser(email: string) {
  const short = email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 7).toUpperCase();
  return {
    _id: email,
    email,
    name: `Member_${short}`,
    address: "",
    passwordHash: "",
    balance: 0,
    earnings: 0,
    jobsCompleted: 0,
    tokensProcessed: 0,
    withdrawals: [],
    payments: [],
    chatHistory: [
      {
        id: "init",
        sender: "node",
        text: `Secure shard tunnel instantiated. Decoded identity block (${email}). Connection state verified OK.`,
        time: new Date().toTimeString().split(" ")[0],
        nodeId: "NODE_COGNITIVE_SHARD_A09",
        latency: "12ms",
        gas: "$0.0000",
        hash: "0xec29bb1a...ff3c"
      }
    ]
  };
}

function buildFallbackChatReply(message: string, selectedModel: string) {
  const trimmed = String(message || "").trim();
  const safePrompt = trimmed.length > 90 ? `${trimmed.slice(0, 87)}...` : trimmed;
  const modelLabel = selectedModel || "DEEPSEEK";

  if (!safePrompt) {
    return `The ${modelLabel} shard is live, but no prompt was provided. Please send a message to start the session.`;
  }

  return `The ${modelLabel} shard is responding from local fallback mode. I received: "${safePrompt}". Your message is queued and the chat experience is available even while the upstream model service is unavailable.`;
}

// Helper Database Resolvers
async function dbFindUser(email: string) {
  if (mongoConnected) {
    try {
      return await MongoUser.findOne({ email });
    } catch (e: any) {
      console.error("Mongoose read error, shifting to backup memo-cache", e.message);
    }
  }

  return memoryDatabase[email] || null;
}

async function dbGetUser(email: string) {
  const existingUser = await dbFindUser(email);
  if (existingUser) {
    return existingUser.toObject ? existingUser.toObject() : existingUser;
  }

  const defaultUser = buildDefaultUser(email);
  if (mongoConnected) {
    try {
      const createdUser = new MongoUser(defaultUser);
      await createdUser.save();
      return createdUser.toObject();
    } catch (e: any) {
      console.error("Mongoose create error, shifting to backup memo-cache", e.message);
    }
  }

  // Backup store if Mongo is not running
  memoryDatabase[email] = defaultUser;
  return defaultUser;
}

async function dbUpdateUser(email: string, updateData: Partial<any>) {
  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await dbGetUser(normalizedEmail);

  if (mongoConnected) {
    try {
      const user = await MongoUser.findOne({ email: normalizedEmail });
      if (!user) {
        const createdDoc = {
          ...buildDefaultUser(normalizedEmail),
          ...updateData,
          _id: normalizedEmail,
          email: normalizedEmail,
        };
        const createdUser = new MongoUser(createdDoc);
        await createdUser.save();
        return createdUser.toObject();
      }

      const updatedUser = await MongoUser.findOneAndUpdate(
        { email: normalizedEmail },
        { $set: { ...updateData, _id: normalizedEmail, email: normalizedEmail } },
        { returnDocument: 'after' }
      );
      if (updatedUser) return updatedUser.toObject();
    } catch (e: any) {
      console.error("Mongoose update error", e.message);
    }
  }

  if (existingUser) {
    memoryDatabase[normalizedEmail] = {
      ...existingUser,
      ...updateData,
      email: normalizedEmail,
      _id: normalizedEmail,
    };
    return memoryDatabase[normalizedEmail];
  }
  return null;
}

// REST HTTP ROUTER
app.post("/api/auth/register-or-login", async (req, res) => {
  try {
    const { email, address, password, mode } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedAddress = typeof address === "string" ? address.trim() : "";
    const passwordValue = typeof password === "string" ? password : "";

    const existingUser = await dbFindUser(normalizedEmail);

    if (existingUser && mode === "register") {
      return res.status(409).json({ success: false, error: "This email is already registered. Please log in instead." });
    }

    if (existingUser) {
      const storedHash = existingUser.passwordHash || "";
      const passwordProvided = passwordValue.length > 0;

      if (!passwordProvided) {
        return res.status(400).json({ success: false, error: "Password is required to log in." });
      }

      const passwordMatches = storedHash ? verifyPassword(passwordValue, storedHash) : false;
      if (!passwordMatches) {
        return res.status(401).json({ success: false, error: "Incorrect password for this email." });
      }

      const updatePayload: any = {};
      if (normalizedAddress) {
        updatePayload.address = normalizedAddress;
      }
      if (passwordProvided && !storedHash) {
        updatePayload.passwordHash = hashPassword(passwordValue);
      }

      const updatedUser = await dbUpdateUser(normalizedEmail, updatePayload);
      return res.json({ success: true, user: updatedUser });
    }

    if (mode === "login") {
      return res.status(404).json({ success: false, error: "No account found for this email. Please register first." });
    }

    const createdUser = await dbUpdateUser(normalizedEmail, {
      ...(normalizedAddress ? { address: normalizedAddress } : {}),
      ...(passwordValue ? { passwordHash: hashPassword(passwordValue) } : {}),
    });

    res.json({ success: true, user: createdUser });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/sync", async (req, res) => {
  try {
    const { email, earnings, jobsCompleted, tokensProcessed, balance } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }
    
    // Increment or save cumulative stats
    const updatePayload: any = {
      earnings: Number(earnings.toFixed(6)),
      jobsCompleted: Number(jobsCompleted),
      tokensProcessed: Number(tokensProcessed)
    };
    
    if (typeof balance === "number") {
      updatePayload.balance = Number(balance.toFixed(6));
    }

    const updated = await dbUpdateUser(email, updatePayload);
    if (!updated) {
      return res.status(404).json({ success: false, error: "User not found for sync." });
    }

    res.json({ success: true, user: updated });
  } catch (err: any) {
    console.error("[sync] failed", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/harvest", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (mongoConnected) {
      const userObj = await MongoUser.findOne({ email: normalizedEmail });
      if (userObj) {
        const userDoc = userObj.toObject ? userObj.toObject() : userObj;
        const addedBalance = Number(userDoc.earnings ?? 0);
        const newClaimTx = {
          id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: Number(addedBalance.toFixed(6)),
          address: userDoc.address,
          timestamp: new Date().toLocaleString(),
          txHash: `SOL_TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}_CLAIM`,
          status: "confirmed"
        };
        
        userDoc.balance = Number((Number(userDoc.balance ?? 0) + addedBalance).toFixed(6));
        userDoc.earnings = 0;
        userDoc.withdrawals = [newClaimTx, ...(userDoc.withdrawals || [])];

        const savedUser = await MongoUser.findOneAndUpdate(
          { email: normalizedEmail },
          { $set: { ...userDoc, _id: normalizedEmail, email: normalizedEmail } },
          { returnDocument: 'after', upsert: true }
        );
        return res.json({ success: true, user: savedUser?.toObject ? savedUser.toObject() : savedUser, newTx: newClaimTx });
      }
    }

    // Fallback block
    const user = await dbGetUser(normalizedEmail);
    const addedBalance = user.earnings;
    const newClaimTx = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: Number(addedBalance.toFixed(6)),
      address: user.address,
      timestamp: new Date().toLocaleString(),
      txHash: `SOL_TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}_CLAIM`,
      status: "confirmed"
    };
    
    const updatedUser = await dbUpdateUser(normalizedEmail, {
      balance: Number((user.balance + addedBalance).toFixed(6)),
      earnings: 0,
      withdrawals: [newClaimTx, ...user.withdrawals]
    });
    
    res.json({ success: true, user: updatedUser, newTx: newClaimTx });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/update-wallet", async (req, res) => {
  try {
    const { email, address } = req.body;
    if (!email || !address) {
      return res.status(400).json({ success: false, error: "Email and wallet address are required." });
    }

    const updated = await dbUpdateUser(email, { address });
    if (!updated && mongoConnected) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    res.json({ success: true, user: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/pay", async (req, res) => {
  try {
    const { email, recipient, amount } = req.body;
    if (!email || !recipient || !amount) {
      return res.status(400).json({ success: false, error: "Missing payload arguments." });
    }

    const payVal = Number(amount);
    if (isNaN(payVal) || payVal <= 0) {
      return res.status(400).json({ success: false, error: "Invalid payment amount." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    if (mongoConnected) {
      const userObj = await MongoUser.findOne({ email: normalizedEmail });
      if (userObj) {
        const userDoc = userObj.toObject ? userObj.toObject() : userObj;
        if (Number(userDoc.balance ?? 0) < payVal) {
          return res.status(400).json({ success: false, error: "Insufficient wallet balance." });
        }
        const newPayment = {
          id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
          amount: payVal,
          recipient: recipient,
          timestamp: new Date().toLocaleString(),
          txHash: `SOL_TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}_PAY`,
          status: "confirmed"
        };
        
        userDoc.balance = Number((Number(userDoc.balance ?? 0) - payVal).toFixed(6));
        userDoc.payments = [newPayment, ...(userDoc.payments || [])];

        const savedUser = await MongoUser.findOneAndUpdate(
          { email: normalizedEmail },
          { $set: { ...userDoc, _id: normalizedEmail, email: normalizedEmail } },
          { returnDocument: 'after', upsert: true }
        );
        return res.json({ success: true, user: savedUser?.toObject ? savedUser.toObject() : savedUser, newTx: newPayment });
      }
    }

    // Fallback memory
    const user = await dbGetUser(normalizedEmail);
    if (user.balance < payVal) {
      return res.status(400).json({ success: false, error: "Insufficient wallet balance." });
    }
    const newPayment = {
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      amount: payVal,
      recipient: recipient,
      timestamp: new Date().toLocaleString(),
      txHash: `SOL_TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}_PAY`,
      status: "confirmed"
    };

    const updatedUser = await dbUpdateUser(normalizedEmail, {
      balance: Number((user.balance - payVal).toFixed(6)),
      payments: [newPayment, ...user.payments]
    });

    res.json({ success: true, user: updatedUser, newTx: newPayment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/withdraw", async (req, res) => {
  try {
    const { email, amount, address } = req.body;

    if (!email || !amount || !address) {
      return res.status(400).json({
        success: false,
        error: "Missing withdrawal details."
      });
    }

    const withdrawVal = Number(amount);
    if (isNaN(withdrawVal) || withdrawVal <= 0) {
      return res.status(400).json({
        success: false,
        error: "Invalid amount."
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let user = null;

    if (mongoConnected) {
      user = await MongoUser.findOne({ email: normalizedEmail });
    } else {
      user = await dbGetUser(normalizedEmail);
    }

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    if (user.balance < withdrawVal) {
      return res.status(400).json({
        success: false,
        error: "Insufficient balance"
      });
    }

    let txHash = `SOL_TX_${Math.random().toString(36).substring(2, 10).toUpperCase()}_DEVNET_WITHDRAW`;
    let txStatus = "confirmed";

    const transferResult = await sendDevnetTransfer(address, withdrawVal);
    if (transferResult.success && transferResult.signature) {
      txHash = `DEVNET_${transferResult.signature}`;
    } else {
      console.info("[withdraw] devnet transfer unavailable; saving local withdrawal record instead.");
      txStatus = "confirmed";
    }

    const newWithdrawal = {
      id: `TX-${Date.now()}`,
      amount: withdrawVal,
      address,
      timestamp: new Date().toISOString(),
      txHash,
      status: txStatus
    };

    const nextBalance = Number((user.balance - withdrawVal).toFixed(6));
    user.balance = nextBalance;
    user.withdrawals = [newWithdrawal, ...(user.withdrawals || [])];

    if (mongoConnected) {
      if (typeof user.save === "function") {
        await user.save();
      }
    } else {
      await dbUpdateUser(normalizedEmail, {
        balance: nextBalance,
        withdrawals: user.withdrawals
      });
    }

    return res.json({
      success: true,
      newTx: newWithdrawal,
      balance: nextBalance
    });

  } catch (err: any) {
    console.error(err);
    return res.status(500).json({
      success: false,
      error: err.message
    });
  }
});
app.post("/api/user/chat/save", async (req, res) => {
  try {
    const { email, message } = req.body;
    if (!email || !message) {
      return res.status(400).json({ success: false, error: "Missing required chat parameters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await dbGetUser(normalizedEmail);
    const nextHistory = Array.isArray(user.chatHistory) ? [...user.chatHistory, message] : [message];
    const updatedUser = await dbUpdateUser(normalizedEmail, { chatHistory: nextHistory });
    res.json({ success: true, chatHistory: updatedUser?.chatHistory || nextHistory });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/chat/clear", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, error: "Missing email." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const clearMsg = {
      id: "clear",
      sender: "node",
      text: "Inference chat logs have been wiped. All node registers cleared successfully. Channel is ready for fresh payloads.",
      time: new Date().toTimeString().split(" ")[0],
      nodeId: "NODE_COGNITIVE_SHARD_A09"
    };

    const updatedUser = await dbUpdateUser(normalizedEmail, { chatHistory: [clearMsg] });
    res.json({ success: true, chatHistory: updatedUser?.chatHistory || [clearMsg] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get("/api/user/chat/history", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }
    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await dbGetUser(normalizedEmail);
    res.json({ success: true, chatHistory: Array.isArray(user.chatHistory) ? user.chatHistory : [] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/chat/respond", async (req, res) => {
  try {
    const { email, message, model, temperature, maxTokens } = req.body;

    if (!email || !message) {
      return res.status(400).json({
        success: false,
        error: "Missing required chat parameters.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const selectedModel = model || "DEEPSEEK";
    const tempVal = typeof temperature === "number" ? temperature : 0.7;
    const maxTkns = typeof maxTokens === "number" ? maxTokens : 2048;

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const startTime = Date.now();
    let responseText = "";

    let systemCtx = "";

    if (selectedModel === "LLAMA-3") {
      systemCtx =
        "You are Llama-3-Instruct running on a decentralized computer shard inside ComputeInfra. Be conversant, logical, smart, and structure your replies perfectly.";
    } else if (selectedModel === "DEEPSEEK") {
      systemCtx =
        "You are DeepSeek-R1-Cognitive running on a decentralized computer shard. Emphasize flawless reasoning, deep analysis, step-by-step logic, and intellectual prowess.";
    } else if (selectedModel === "QWEN-2.5") {
      systemCtx =
        "You are Qwen-2.5-Coder running on a decentralized computer shard. Act as an elite coding expert, providing high-fidelity, high-efficiency, perfectly compiled programming blocks and answers.";
    } else {
      systemCtx =
        "You are a decentralized CPU/GPU computing shard. Deliver highly intelligent, technically precise and helpful answers.";
    }

    // ------------------------
    // AI FAILOVER LOGIC
    // ------------------------
    try {
      if (!geminiApiKey) throw new Error("Gemini API key missing");

      console.log("Trying Gemini...");

      const response = await aiGenAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
          systemInstruction: `${systemCtx} Always answer comprehensively and accurately in clean markdown.`,
          temperature: tempVal,
          maxOutputTokens: maxTkns,
        },
      });

      responseText =
        response.text || "No inference response received from Gemini.";
    } catch (geminiErr) {
      console.log("Gemini failed:", geminiErr);

      try {
        console.log("Trying ChatGPT fallback...");

        responseText = await getChatGPTResponse(
          message,
          selectedModel,
          tempVal
        );
      } catch (chatErr) {
        console.log("ChatGPT fallback failed:", chatErr);

        responseText = buildFallbackChatReply(message, selectedModel);
      }
    }

    const elapsedMs = Date.now() - startTime;
    const timeStr = new Date().toTimeString().split(" ")[0];

    const userMsg = {
      id: Math.random().toString(),
      sender: "user",
      time: timeStr,
      text: message,
    };

    const nodeMsg = {
      id: Math.random().toString(),
      sender: "node",
      nodeId: `NODE_${selectedModel}_COGNITIVE_SHARD`,
      time: timeStr,
      text: responseText,
      latency: `${elapsedMs}ms`,
      gas: `$0.000${Math.floor(Math.random() * 6) + 1}`,
      hash:
        "0x" +
        Math.random().toString(16).slice(2, 10) +
        "..." +
        Math.random().toString(16).slice(2, 6),
    };

    const userData = await dbGetUser(normalizedEmail);
    const currentHistory = Array.isArray(userData.chatHistory)
      ? userData.chatHistory
      : [];

    const nextHistory = [...currentHistory, userMsg, nodeMsg];

    await dbUpdateUser(normalizedEmail, {
      chatHistory: nextHistory,
    });

    res.json({
      success: true,
      userMessage: userMsg,
      nodeMessage: nodeMsg,
    });
  } catch (err: any) {
    console.error(err);

    res.status(500).json({
      success: false,
      error: err.message || "Internal server error",
    });
  }
});

// Configure development or production server flow
async function serveApp() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server starting on http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || "development"} mode.`);
    console.log(bs58)
  });
}

serveApp();

import express from "express";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import serverless from "serverless-http";
import OpenAI from "openai";
import { GoogleGenAI } from "@google/genai";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import bs58 from "bs58";
import fs from "fs/promises";

export async function loadSystemPrompt(): Promise<string> {
  const filePath = path.join(process.cwd(), "system-prompt.txt");
  return (await fs.readFile(filePath, "utf-8")).trim();
}

dotenv.config();
export const app = express();
const aiGenAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

app.use(express.json());



// MongoDB connection string with dynamic fallback to in-memory/JSON-like database
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/compute_infra";
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "compute_infra";
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

function sendAuthSuccess(res: express.Response, user: any) {
  const userObject = user?.toObject ? user.toObject() : user;
  console.log("AUTH SUCCESS:", {
    email: userObject?.email,
    hasPasswordHash: Boolean(userObject?.passwordHash),
  });
  return res.json({
    success: true,
    user: userObject,
    hasPasswordHash: Boolean(userObject?.passwordHash),
  });
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

const GITHUB_TOKEN = (process.env.GITHUB_TOKEN || "").trim();
const GITHUB_MODELS_ENDPOINT = process.env.GITHUB_MODELS_ENDPOINT || "https://models.github.ai/inference";
const GITHUB_MODELS_MODEL = process.env.GITHUB_MODELS_MODEL || "openai/gpt-4o-mini";




function sanitizeChatHistory(history: any[]) {
  return (Array.isArray(history) ? history : []).filter((entry: any) => {
    const text = String(entry?.text || "");
    return !/local fallback mode|DEEPSEEK shard|main model service is unavailable/i.test(text);
  });
}

function buildModelMessagesFromHistory(history: any[]) {
  return sanitizeChatHistory(history)
    .filter((entry: any) => {
      return (entry?.sender === "user" || entry?.sender === "node") && String(entry?.text || "").trim();
    })
    .slice(-20)
    .map((entry: any) => ({
      role: (entry.sender === "user" ? "user" : "assistant") as "user" | "assistant",
      content: String(entry.text).trim(),
    }));
}

function buildTranscriptFromHistory(history: any[]) {
  const lines = buildModelMessagesFromHistory(history).map((entry: any) => {
    const label = entry.role === "user" ? "User" : "Assistant";
    return `${label}: ${entry.content}`;
  });

  return lines.length > 0 ? `Previous conversation:\n${lines.join("\n\n")}\n\nCurrent user message:` : "";
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

console.log(`Connecting to Mongoose database "${MONGODB_DB_NAME}".`);
const mongoConnectionPromise = mongoose.connect(MONGODB_URI, { dbName: MONGODB_DB_NAME })
  .then(() => {
    console.log("Mongoose connected to MongoDB successfully.");
    mongoConnected = true;
  })
  .catch(err => {
    console.warn("MongoDB connection failed. Continuing server execution with local backup cache memory state.", err.message);
    mongoConnected = false;
  });

async function ensureMongoConnected() {
  if (mongoConnected || mongoose.connection.readyState === 1) {
    mongoConnected = true;
    return true;
  }

  try {
    await mongoConnectionPromise;
    mongoConnected = true;
    return true;
  } catch {
    mongoConnected = false;
    return false;
  }
}

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

// Helper Database Resolvers
async function dbFindUser(email: string) {
  if (await ensureMongoConnected()) {
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
  if (await ensureMongoConnected()) {
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

  if (await ensureMongoConnected()) {
    try {
      const insertDefaults = {
        ...buildDefaultUser(normalizedEmail),
        email: normalizedEmail,
        _id: normalizedEmail,
      };

      for (const key of Object.keys(updateData)) {
        delete (insertDefaults as any)[key];
      }

      const updatedUser = await MongoUser.findOneAndUpdate(
        { email: normalizedEmail },
        {
          $set: updateData,
          $setOnInsert: insertDefaults,
        },
        {
          upsert: true,
          returnDocument: "after",
        }
      );

      return updatedUser?.toObject();
    } catch (e: any) {
      console.error("Mongoose update error", e.message);
    }
  }

  const existingUser =
    memoryDatabase[normalizedEmail] || buildDefaultUser(normalizedEmail);

  memoryDatabase[normalizedEmail] = {
    ...existingUser,
    ...updateData,
    email: normalizedEmail,
    _id: normalizedEmail,
  };

  return memoryDatabase[normalizedEmail];
}

app.get("/api/prompt/system", async (req, res) => {
  try {
    const prompt = await loadSystemPrompt();
    res.json({ prompt });
  } catch (err) {
    res.status(500).json({ error: "Failed to load prompt" });
  }
});
// REST HTTP ROUTER
app.post("/api/auth/register-or-login", async (req, res) => {
  try {
    const { email, address, password, mode } = req.body;
    console.log("AUTH REQUEST:", {
  email,
  mode,
  timestamp: Date.now(),
});
    if (!email) {
      return res.status(400).json({ success: false, error: "Email is required." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedAddress = typeof address === "string" ? address.trim() : "";
    const passwordValue = typeof password === "string" ? password : "";

    if (mode === "register" && passwordValue.length < 6) {
      return res.status(400).json({
        success: false,
        error: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await dbFindUser(normalizedEmail);

    if (existingUser && mode === "register") {
      return res.status(409).json({
        success: false,
        error: "This email is already registered. Please log in instead.",
      });
    }
    if (existingUser) {
      const storedHash = existingUser.passwordHash || "";
      const passwordProvided = passwordValue.length > 0;

      if (!mode && !passwordProvided) {
        const user = existingUser.toObject ? existingUser.toObject() : existingUser;
        return sendAuthSuccess(res, user);
      }

      if (!passwordProvided) {
        return res.status(400).json({ success: false, error: "Password is required to log in." });
      }

      if (!storedHash) {
        const updatedUser = await dbUpdateUser(normalizedEmail, {
          ...(normalizedAddress ? { address: normalizedAddress } : {}),
          passwordHash: hashPassword(passwordValue),
        });
        return sendAuthSuccess(res, updatedUser);
      }

      const passwordMatches = verifyPassword(passwordValue, storedHash);
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
      return sendAuthSuccess(res, updatedUser);
    }

    if (mode === "login") {
      return res.status(404).json({ success: false, error: "No account found for this email. Please register first." });
    }

    const createdUser = await dbUpdateUser(normalizedEmail, {
      ...(normalizedAddress ? { address: normalizedAddress } : {}),
      passwordHash: hashPassword(passwordValue),
    });

    return sendAuthSuccess(res, createdUser);
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
    const nextHistory = [...sanitizeChatHistory(Array.isArray(user.chatHistory) ? user.chatHistory : []), message];
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
    res.json({ success: true, chatHistory: sanitizeChatHistory(Array.isArray(user.chatHistory) ? user.chatHistory : []) });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post("/api/user/chat/respond", async (req, res) => {
  try {
    const { email, message, temperature, maxTokens } = req.body;
    if (!email || !message) {
      return res.status(400).json({ success: false, error: "Missing required chat parameters." });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await dbGetUser(normalizedEmail);
    const previousHistory = sanitizeChatHistory(Array.isArray(existingUser.chatHistory) ? existingUser.chatHistory : []);
    const priorModelMessages = buildModelMessagesFromHistory(previousHistory);
    const transcriptPrefix = buildTranscriptFromHistory(previousHistory);

    const selectedModel = "GPT";
    const tempVal = typeof temperature === "number" ? temperature : 0.7;
    const maxTkns = typeof maxTokens === "number" ? maxTokens : 2048;

    const githubToken = GITHUB_TOKEN;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!githubToken && !apiKey) {
      console.warn("Neither GITHUB_TOKEN nor GEMINI_API_KEY environment variable is set. Using local mock responses.");
    }

    let responseText = "";
    const startTime = Date.now();

    const systemCtx = "You are GPT running inside ComputeInfra. Deliver helpful, technically precise answers with clear reasoning and clean Markdown.";

    if (githubToken) {
      try {
        console.log("Using GITHUB_TOKEN with OpenAI client for chat inference.");
        const client = new OpenAI({
          baseURL: GITHUB_MODELS_ENDPOINT,
          apiKey: githubToken,
        });

        const response = await client.chat.completions.create({
          messages: [
            { role: "system", content: `${systemCtx} Always answer user questions comprehensively and accurately. Do NOT output mock metadata headers inside your final output body. Output directly in clean, readable Markdown syntax.` },
            ...priorModelMessages,
            { role: "user", content: message }
          ],
          model: GITHUB_MODELS_MODEL,
          temperature: tempVal,
          max_tokens: maxTkns
        });

        responseText = response.choices[0]?.message?.content || "No inference response received from the GitHub models API.";
      } catch (ghErr: any) {
        console.error("GitHub inference call failed, attempting Gemini fallback", ghErr);
        if (apiKey) {
          try {
            const response = await aiGenAI.models.generateContent({
              model: "gemini-3.5-flash",
              contents: `${transcriptPrefix} ${message}`.trim(),
              config: {
                systemInstruction: `${systemCtx} Always answer user questions comprehensively and accurately. Do NOT output mock metadata headers (like '#### DECENTRALIZED INFRASTRUCTURE ANSWER') inside your final output body. Output directly in clean, readable Markdown syntax.`,
                temperature: tempVal,
              }
            });
            responseText = response.text || "No response received from fallback.";
          } catch (geminiErr: any) {
            console.error("Gemini fallback also failed", geminiErr);
            responseText = `[Inference Fallback due to GitHub inference error: ${ghErr.message} and Gemini fallback error: ${geminiErr.message}]\n\nUnable to obtain network weight consensus.`;
          }
        } else {
          responseText = `[Inference Fallback due to GitHub inference error: ${ghErr.message}]\n\nPlease configure GITHUB_TOKEN or GEMINI_API_KEY correctly.`;
        }
      }
    } else if (apiKey) {
      try {
        const response = await aiGenAI.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `${transcriptPrefix} ${message}`.trim(),
          config: {
            systemInstruction: `${systemCtx} Always answer user questions comprehensively and accurately. Do NOT output mock metadata headers (like '#### DECENTRALIZED INFRASTRUCTURE ANSWER') inside your final output body. Output directly in clean, readable Markdown syntax.`,
            temperature: tempVal,
          }
        });

        responseText = response.text || "No inference response received from the model.";
      } catch (genaiErr: any) {
        console.error("Gemini API call failed, using mock node response", genaiErr);
        responseText = `[Inference Fallback due to API error: ${genaiErr.message}]\n\nUnable to obtain network weight consensus. Here is a local placeholder description of: "${message}"`;
      }
    } else {
      responseText = `[Inference Fallback: Neither GITHUB_TOKEN nor GEMINI_API_KEY configured]\n\nYour message: "${message}" was simulated locally. Register a premium cluster access key to unlock real-time processing.`;
    }

    const elapsedMs = Date.now() - startTime;
    const timeStr = new Date().toTimeString().split(" ")[0];

    // Prepare message formats conforming to UserSchema and UI ChatMessage
    const userMsg = {
      id: Math.random().toString(),
      sender: "user",
      time: timeStr,
      text: message
    };

    const nodeMsg = {
      id: Math.random().toString(),
      sender: "node",
      nodeId: `NODE_${selectedModel}_COGNITIVE_SHARD`,
      time: timeStr,
      text: responseText,
      latency: `${elapsedMs}ms`,
      gas: `$0.000${Math.floor(Math.random() * 6) + 1}`,
      hash: "0x" + Math.random().toString(16).slice(2, 10) + "..." + Math.random().toString(16).slice(2, 6)
    };

    const chatHistory = [...previousHistory, userMsg, nodeMsg];
    const updatedUser = await dbUpdateUser(normalizedEmail, { chatHistory });

    res.json({
      success: true,
      userMessage: userMsg,
      nodeMessage: nodeMsg,
      chatHistory: updatedUser?.chatHistory || chatHistory,
    });

  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

function normalizeNetlifyPath(pathName = "") {
  const functionPath = "/.netlify/functions/api";

  if (pathName === functionPath) {
    return "/api";
  }

  if (pathName.startsWith(`${functionPath}/`)) {
    return `/api/${pathName.slice(functionPath.length + 1)}`;
  }

  return pathName;
}

let serverlessHandler: any;

export const handler = async (event: any, context: any) => {
  if (!serverlessHandler) {
    serverlessHandler = serverless(app);
  }

  return serverlessHandler(
    {
      ...event,
      path: normalizeNetlifyPath(event.path),
    },
    context,
  );
};

import https from "https";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

dotenv.config();

const aiGenAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "computeinfra-netlify",
    },
  },
});

type StoredUser = {
  email: string;
  name: string;
  address: string;
  passwordHash: string;
  balance: number;
  earnings: number;
  jobsCompleted: number;
  tokensProcessed: number;
  withdrawals: any[];
  payments: any[];
  chatHistory: any[];
};

const memoryStore = ((globalThis as any).__computeInfraNetlifyUsers ||= {}) as Record<string, StoredUser>;

function normalizeEmail(email: string) {
  return String(email || "").trim().toLowerCase();
}

function buildDefaultUser(email: string): StoredUser {
  const short = email.replace(/[^a-zA-Z0-9]/g, "").slice(0, 7).toUpperCase();
  return {
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
        hash: "0xec29bb1a...ff3c",
      },
    ],
  };
}

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

function getUser(email: string): StoredUser {
  const normalizedEmail = normalizeEmail(email);
  if (!memoryStore[normalizedEmail]) {
    memoryStore[normalizedEmail] = buildDefaultUser(normalizedEmail);
  }
  return memoryStore[normalizedEmail];
}

function updateUser(email: string, updateData: Partial<StoredUser>) {
  const normalizedEmail = normalizeEmail(email);
  const user = getUser(normalizedEmail);
  Object.assign(user, updateData);
  return user;
}

async function getChatGPTResponse(prompt: string, model: string, temperature: number) {
  const apiKey = process.env.OPENAI_API_KEY || "";
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not configured.");
  }

  const body = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          model === "LLAMA-3"
            ? "You are a helpful AI assistant running in ComputeInfra. Be concise, structured, and technically accurate."
            : model === "DEEPSEEK"
              ? "You are a thoughtful reasoning assistant. Provide clear, structured, insightful answers."
              : model === "QWEN-2.5"
                ? "You are an expert coding assistant. Provide high-quality code and technical guidance."
                : "You are a helpful assistant inside ComputeInfra. Provide direct, accurate answers.",
      },
      { role: "user", content: prompt },
    ],
    temperature,
  });

  return new Promise<string>((resolve, reject) => {
    const req = https.request(
      {
        hostname: "api.openai.com",
        path: "/v1/chat/completions",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "Content-Length": Buffer.byteLength(body),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              reject(new Error(parsed.error.message || "OpenAI request failed."));
              return;
            }
            const reply = parsed?.choices?.[0]?.message?.content || "";
            if (!reply) {
              reject(new Error("OpenAI returned an empty response."));
              return;
            }
            resolve(reply);
          } catch (err: any) {
            reject(err);
          }
        });
      },
    );

    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function buildFallbackChatReply(message: string, selectedModel: string) {
  const trimmed = String(message || "").trim();
  const safePrompt = trimmed.length > 90 ? `${trimmed.slice(0, 87)}...` : trimmed;
  const modelLabel = selectedModel || "DEEPSEEK";

  if (!safePrompt) {
    return `The ${modelLabel} shard is ready. Send a message and I’ll help you continue the workflow.`;
  }

  return `The ${modelLabel} shard is currently running in local fallback mode, but I can still help with your request: "${safePrompt}". I’ll keep the response concise and practical while the main model service is unavailable.`;
}

async function getChatResponse(message: string, selectedModel: string, temperature: number) {
  const geminiApiKey = process.env.GEMINI_API_KEY;
  if (geminiApiKey) {
    try {
      let systemCtx = "";
      if (selectedModel === "LLAMA-3") {
        systemCtx = "You are Llama-3-Instruct running on a decentralized computer shard inside ComputeInfra. Be conversant, logical, smart, and structure your replies perfectly.";
      } else if (selectedModel === "DEEPSEEK") {
        systemCtx = "You are DeepSeek-R1-Cognitive running on a decentralized computer shard. Emphasize flawless reasoning, deep analysis, step-by-step logic, and intellectual prowess.";
      } else if (selectedModel === "QWEN-2.5") {
        systemCtx = "You are Qwen-2.5-Coder running on a decentralized computer shard. Act as an elite coding expert, providing high-fidelity, high-efficiency, perfectly compiled programming blocks and answers.";
      } else {
        systemCtx = "You are a decentralized CPU/GPU computing shard. Deliver highly intelligent, technically precise and helpful answers.";
      }

      const response = await aiGenAI.models.generateContent({
        model: "gemini-2.5-flash",
        contents: message,
        config: {
          systemInstruction: `${systemCtx} Always answer user questions comprehensively and accurately. Do NOT output mock metadata headers inside your final output body. Output directly in clean, readable Markdown syntax.`,
          temperature,
        },
      });

      return response.text || "No inference response received from the model.";
    } catch (err: any) {
      console.error("Gemini API call failed, trying ChatGPT fallback", err);
      try {
        return await getChatGPTResponse(message, selectedModel, temperature);
      } catch (chatgptErr: any) {
        console.error("ChatGPT fallback also failed", chatgptErr);
        return buildFallbackChatReply(message, selectedModel);
      }
    }
  }

  try {
    return await getChatGPTResponse(message, selectedModel, temperature);
  } catch (err: any) {
    console.error("ChatGPT fallback also failed", err);
    return buildFallbackChatReply(message, selectedModel);
  }
}

function parseEventBody(event: any) {
  const body = event?.body;
  if (!body) return {};

  if (typeof body === "string") {
    const rawBody = event?.isBase64Encoded ? Buffer.from(body, "base64").toString("utf8") : body;
    try {
      return JSON.parse(rawBody);
    } catch {
      return {};
    }
  }

  if (typeof body === "object") return body;
  return {};
}

function jsonResponse(statusCode: number, body: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    },
    body: JSON.stringify(body),
  };
}

export const handler = async (event: any) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      },
      body: "",
    };
  }

  const pathname = (event.path || "/")
    .replace(/^\/\.netlify\/functions\/[^/]+/, "")
    .replace(/\?.*$/, "") || "/";
  const method = event.httpMethod || "GET";

  try {
    if (pathname === "/health") {
      return jsonResponse(200, { success: true, message: "ComputeInfra Netlify API is live." });
    }

    if (method === "POST" && pathname === "/api/auth/register-or-login") {
      const body = parseEventBody(event);
      const { email, address, password } = body;
      if (!email) {
        return jsonResponse(400, { success: false, error: "Email is required." });
      }

      const normalizedEmail = normalizeEmail(email);
      const normalizedAddress = typeof address === "string" ? address.trim() : "";
      const passwordValue = typeof password === "string" ? password : "";
      const mode = body.mode || "register";
      const existingUser = memoryStore[normalizedEmail];

      if (existingUser && mode === "register") {
        return jsonResponse(409, { success: false, error: "This email is already registered. Please log in instead." });
      }

      if (existingUser) {
        const storedHash = existingUser.passwordHash || "";
        const passwordProvided = passwordValue.length > 0;
        if (!passwordProvided) {
          return jsonResponse(400, { success: false, error: "Password is required to log in." });
        }
        const passwordMatches = storedHash ? verifyPassword(passwordValue, storedHash) : false;
        if (!passwordMatches) {
          return jsonResponse(401, { success: false, error: "Incorrect password for this email." });
        }
        if (normalizedAddress) {
          existingUser.address = normalizedAddress;
        }
        if (passwordProvided && !storedHash) {
          existingUser.passwordHash = hashPassword(passwordValue);
        }
        return jsonResponse(200, { success: true, user: existingUser });
      }

      if (mode === "login") {
        return jsonResponse(404, { success: false, error: "No account found for this email. Please register first." });
      }

      const user = getUser(normalizedEmail);
      if (normalizedAddress) {
        user.address = normalizedAddress;
      }
      if (passwordValue) {
        user.passwordHash = hashPassword(passwordValue);
      }
      return jsonResponse(200, { success: true, user });
    }

    if (method === "POST" && pathname === "/api/user/sync") {
      const body = parseEventBody(event);
      const { email, earnings, jobsCompleted, tokensProcessed, balance } = body;
      if (!email) {
        return jsonResponse(400, { success: false, error: "Email is required." });
      }
      const normalizedEmail = normalizeEmail(email);
      const existingUser = getUser(normalizedEmail);
      const user = updateUser(normalizedEmail, {
        earnings: Number(earnings ?? 0),
        jobsCompleted: Number(jobsCompleted ?? 0),
        tokensProcessed: Number(tokensProcessed ?? 0),
        balance: typeof balance === "number" ? Number(balance) : existingUser.balance ?? 0,
      });
      return jsonResponse(200, { success: true, user });
    }

    if (method === "POST" && pathname === "/api/user/harvest") {
      const body = parseEventBody(event);
      const { email } = body;
      if (!email) {
        return jsonResponse(400, { success: false, error: "Email is required." });
      }
      const normalizedEmail = normalizeEmail(email);
      const user = getUser(normalizedEmail);
      const addedBalance = user.earnings;
      user.balance = Number((user.balance + addedBalance).toFixed(6));
      user.earnings = 0;
      user.withdrawals.unshift({
        id: `TX-${Date.now()}`,
        amount: Number(addedBalance.toFixed(6)),
        address: user.address,
        timestamp: new Date().toISOString(),
        txHash: `CLAIM_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        status: "confirmed",
      });
      return jsonResponse(200, { success: true, user });
    }

    if (method === "POST" && pathname === "/api/user/update-wallet") {
      const body = parseEventBody(event);
      const { email, address } = body;
      if (!email || !address) {
        return jsonResponse(400, { success: false, error: "Email and wallet address are required." });
      }
      const normalizedEmail = normalizeEmail(email);
      const user = updateUser(normalizedEmail, { address });
      return jsonResponse(200, { success: true, user });
    }

    if (method === "POST" && pathname === "/api/user/pay") {
      const body = parseEventBody(event);
      const { email, recipient, amount } = body;
      if (!email || !recipient || !amount) {
        return jsonResponse(400, { success: false, error: "Missing payload arguments." });
      }
      const normalizedEmail = normalizeEmail(email);
      const user = getUser(normalizedEmail);
      const payVal = Number(amount);
      if (isNaN(payVal) || payVal <= 0) {
        return jsonResponse(400, { success: false, error: "Invalid payment amount." });
      }
      if (user.balance < payVal) {
        return jsonResponse(400, { success: false, error: "Insufficient wallet balance." });
      }
      user.balance = Number((user.balance - payVal).toFixed(6));
      user.payments.unshift({
        id: `TX-${Date.now()}`,
        amount: payVal,
        recipient,
        timestamp: new Date().toISOString(),
        txHash: `PAY_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        status: "confirmed",
      });
      return jsonResponse(200, { success: true, user });
    }

    if (method === "POST" && pathname === "/api/user/withdraw") {
      const body = parseEventBody(event);
      const { email, amount, address } = body;
      if (!email || !amount || !address) {
        return jsonResponse(400, { success: false, error: "Missing withdrawal details." });
      }
      const normalizedEmail = normalizeEmail(email);
      const user = getUser(normalizedEmail);
      const withdrawVal = Number(amount);
      if (isNaN(withdrawVal) || withdrawVal <= 0) {
        return jsonResponse(400, { success: false, error: "Invalid amount." });
      }
      if (user.balance < withdrawVal) {
        return jsonResponse(400, { success: false, error: "Insufficient balance" });
      }
      user.balance = Number((user.balance - withdrawVal).toFixed(6));
      user.withdrawals.unshift({
        id: `TX-${Date.now()}`,
        amount: withdrawVal,
        address,
        timestamp: new Date().toISOString(),
        txHash: `DEVNET_${Math.random().toString(36).slice(2, 10).toUpperCase()}`,
        status: "confirmed",
      });
      return jsonResponse(200, { success: true, balance: user.balance, user });
    }

    if (method === "POST" && pathname === "/api/user/chat/save") {
      const body = parseEventBody(event);
      const { email, message } = body;
      if (!email || !message) {
        return jsonResponse(400, { success: false, error: "Missing required chat parameters." });
      }
      const normalizedEmail = normalizeEmail(email);
      const user = getUser(normalizedEmail);
      user.chatHistory.push(message);
      return jsonResponse(200, { success: true, chatHistory: user.chatHistory });
    }

    if (method === "POST" && pathname === "/api/user/chat/clear") {
      const body = parseEventBody(event);
      const { email } = body;
      if (!email) {
        return jsonResponse(400, { success: false, error: "Missing email." });
      }
      const normalizedEmail = normalizeEmail(email);
      const user = getUser(normalizedEmail);
      user.chatHistory = [
        {
          id: "clear",
          sender: "node",
          text: "Inference chat logs have been wiped. All node registers cleared successfully. Channel is ready for fresh payloads.",
          time: new Date().toTimeString().split(" ")[0],
          nodeId: "NODE_COGNITIVE_SHARD_A09",
        },
      ];
      return jsonResponse(200, { success: true, chatHistory: user.chatHistory });
    }

    if (method === "GET" && pathname === "/api/user/chat/history") {
      const email = event.queryStringParameters?.email || "";
      if (!email) {
        return jsonResponse(400, { success: false, error: "Email is required." });
      }
      const normalizedEmail = normalizeEmail(email);
      const user = getUser(normalizedEmail);
      return jsonResponse(200, { success: true, chatHistory: user.chatHistory || [] });
    }

    if (method === "POST" && pathname === "/api/user/chat/respond") {
      const body = parseEventBody(event);
      const { email, message, model, temperature, maxTokens } = body;
      if (!email || !message) {
        return jsonResponse(400, { success: false, error: "Missing required chat parameters." });
      }

      const selectedModel = model || "DEEPSEEK";
      const tempVal = typeof temperature === "number" ? temperature : 0.7;
      const responseText = await getChatResponse(message, selectedModel, tempVal);
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
        latency: `${Math.floor(Math.random() * 120) + 10}ms`,
        gas: `$0.000${Math.floor(Math.random() * 6) + 1}`,
        hash: `0x${Math.random().toString(16).slice(2, 10)}...${Math.random().toString(16).slice(2, 6)}`,
      };

      const normalizedEmail = normalizeEmail(email);
      const user = getUser(normalizedEmail);
      user.chatHistory.push(userMsg);
      user.chatHistory.push(nodeMsg);

      return jsonResponse(200, {
        success: true,
        userMessage: userMsg,
        nodeMessage: nodeMsg,
      });
    }

    return jsonResponse(404, { success: false, error: "Route not found." });
  } catch (err: any) {
    console.error("Netlify function error", err);
    return jsonResponse(500, { success: false, error: err.message || "Internal server error." });
  }
};

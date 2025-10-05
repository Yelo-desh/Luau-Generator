import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

if (!process.env.OPENAI_API_KEY) {
  console.error("❌ Missing OPENAI_API_KEY in environment variables");
  process.exit(1);
}

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are an assistant that ONLY outputs working Roblox Luau code inside a single code block. No explanations.`;

app.post("/api/generate-luau", async (req, res) => {
  try {
    const { userPrompt, temperature = 0.1, maxTokens = 800 } = req.body;
    if (!userPrompt) return res.status(400).json({ error: "userPrompt required" });

    const instruction = `${SYSTEM_PROMPT}\nUser request:\n\"\"\"\n${userPrompt}\n\"\"\"\n`;

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      instructions: instruction,
      input: userPrompt,
      temperature,
      max_output_tokens: maxTokens,
    });

    let outText = response.output_text || null;
    if (!outText) return res.status(500).json({ error: "no text from model", raw: response });

    res.json({ code: outText.trim() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error", detail: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));

import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config()
  //  GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/AKfycbyf2sotopkgFeDzr1Ag33lnukBr3GoYVEMSgZWbCKrjfUGJ-OCH3ZfWAd_EOO_G2Eg3fQ/exec
  //  PORT=4000

const app = express();
const PORT = process.env.PORT || 4000;
const GOOGLE_SCRIPT_URL =
  process.env.GOOGLE_SCRIPT_URL || "YOUR_GOOGLE_SCRIPT_DEPLOYED_URL";

// Middleware
app.use(express.json());
app.use(cors()); // Handles CORS automatically

// Health check route
app.get("/", (req, res) => {
  res.json({ status: "ok", message: "Proxy server is running" });
});

// Proxy endpoint for inserting rows into Google Sheets via Apps Script
app.post("/api/insert-rows", async (req, res) => {
  try {
    // Forward the payload to the Google Apps Script endpoint
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body),
    });

    // Try to parse as JSON, fallback to text if not JSON
    let data;
    const text = await response.text();
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }
    res.json(data);
  } catch (err) {
    console.error("❌ Proxy error:", err);
    res.status(500).json({ error: err.toString() });
  }
});

// Handle CORS preflight requests (optional, since cors() handles most cases)
app.options("/api/insert-rows", (req, res) => {
  res.sendStatus(204);
});

app.listen(PORT, () => {
  console.log(`✅ Proxy server running on http://localhost:${PORT}`);
});

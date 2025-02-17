import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const WHITELIST = [
  "0xDd3DEA716B95CC68b51f764bC25111C60De5D3F0".toLowerCase(),
  "0xF3D8ED49c331B65Eca19cae99F7Dd090fE60BE22".toLowerCase(),
  "0x125a8f35ae11BA5ea94cAa70B404E1d1F785Ae45".toLowerCase(),
  "0xE8e87d195451688384543AB10a7B3d6465136b2C".toLowerCase(),
  "0x48DF98d9E769fC056e447839DD77F3745d914545".toLowerCase() // Debugging Wallet
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address, prompt } = req.body;

  console.log("Received request:", { address, prompt });

  if (!address || !WHITELIST.includes(address.toLowerCase())) {
    console.error("Unauthorized address:", address);
    return res.status(403).json({ error: "Unauthorized wallet" });
  }

  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OpenAI API Key");
    return res.status(500).json({ error: "Server misconfiguration: Missing API key" });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-latest", // ✅ Updated model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      },
      { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" } }
    );

    console.log("ChatGPT response:", JSON.stringify(response.data, null, 2));
    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("OpenAI API Error:", error.response?.data || error.message);

    // Send detailed error response
    res.status(500).json({ error: "ChatGPT API error", details: error.response?.data || error.message });
  }
}

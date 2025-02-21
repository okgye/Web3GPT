import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import axios from 'axios';

const client = new OpenAI();
const WHITELIST = [
  "0xDd3DEA716B95CC68b51f764bC25111C60De5D3F0".toLowerCase(),
  "0xF3D8ED49c331B65Eca19cae99F7Dd090fE60BE22".toLowerCase(),
  "0x125a8f35ae11BA5ea94cAa70B404E1d1F785Ae45".toLowerCase(),
  "0xE8e87d195451688384543AB10a7B3d6465136b2C".toLowerCase(),
  "0x48DF98d9E769fC056e447839DD77F3745d914545".toLowerCase() // Debugging Wallet
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OpenAI API Key");
    return res.status(500).json({ error: "Server misconfiguration: Missing API key" });
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { address, prompt } = req.query;

  if (!address || typeof address !== 'string' || !WHITELIST.includes(address.toLowerCase())) {
    console.error("Unauthorized address:", address);
    return res.status(403).json({ error: "Unauthorized wallet" });
  }

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: "Missing or invalid prompt" });
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
  });

  const stream = await client.chat.completions.create({
    model: 'chatgpt-4o-latest',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

for await (const chunk of stream) {
  // Extract the new content from the chunk.
  const content = chunk.choices[0]?.delta?.content || '';
  // Write the content to the HTTP response in SSE format.
  res.write(`data: ${content}\n\n`);
}
res.end();
}

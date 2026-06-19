// functions/agent_price_oracle.js
const input = globalThis.input || {};
const token = input.token || "sui"; // Default to sui

console.log(`[Agent Oracle] Fetching live price for ${token}...`);

// 1. Fetch live price from Coingecko
const cgUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${token},bitcoin&vs_currencies=usd`;
const cgResponse = await globalThis.SuiProxy.fetch(cgUrl, { method: 'GET' });

if (cgResponse.status !== 200) {
  return { success: false, error: "Failed to fetch price from Coingecko" };
}

const prices = await cgResponse.json();
const tokenPrice = prices[token]?.usd;
const btcPrice = prices['bitcoin']?.usd;

console.log(`[Agent Oracle] Live prices -> ${token}: $${tokenPrice}, BTC: $${btcPrice}`);

// 2. Ask OpenAI to format the response into an engaging agent message
const openAiUrl = "https://api.openai.com/v1/chat/completions";
const openAiPayload = {
  model: "gpt-4o",
  messages: [
    {
      role: "system",
      content: "You are a witty decentralized AI agent running on the Sui blockchain. You provide real-time crypto prices to users with a bit of humor."
    },
    {
      role: "user",
      content: `The current live price of ${token.toUpperCase()} is $${tokenPrice} and Bitcoin is at $${btcPrice}. Give me a short, 2-sentence market update based on this.`
    }
  ]
};

console.log("[Agent Oracle] Requesting OpenAI analysis...");

const aiResponse = await globalThis.SuiProxy.fetch(openAiUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer \${SECRET.OPENAI_API_KEY}`
  },
  body: JSON.stringify(openAiPayload)
});

if (aiResponse.status !== 200) {
  const errorText = await aiResponse.text();
  console.log("OpenAI API Error: " + errorText);
  return { success: false, error: "Failed to fetch analysis from OpenAI." };
}

const aiData = await aiResponse.json();
const agentMessage = aiData.choices?.[0]?.message?.content || "No message generated.";

console.log(`[Agent Oracle] AI Output: ${agentMessage}`);

return { 
  success: true, 
  token: token,
  price: tokenPrice,
  message: agentMessage 
};

// scripts/test_gemini.js
const input = globalThis.input || { prompt: "Explain the concept of Fully Homomorphic Encryption in one short sentence." };

console.log("Asking Gemini: " + input.prompt);

const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-pro-preview:generateContent?key=\${SECRET.GEMINI_API_KEY}`;

const payload = {
  contents: [{
    parts: [{
      text: input.prompt
    }]
  }]
};

const response = await globalThis.SuiProxy.fetch(targetUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(payload)
});

if (response.status !== 200) {
  const errorText = await response.text();
  console.log("Gemini API Error: " + errorText);
  return { success: false, error: errorText };
}

const data = await response.json();
const answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer received.";

console.log("Gemini Answer: " + answer);
return { success: true, answer };

// functions/coupon_validator.js
// Live Serverless Coupon Validation Isolate for SuiNode Store

console.log("----------------------------------------");
console.log("🎟️ DECENTRALIZED COUPON VALIDATION RUNNER");
console.log("----------------------------------------");

const input = globalThis.input || {};
const coupon = (input.coupon || "").trim().toUpperCase();

console.log("Validating coupon code: " + coupon);

if (!coupon) {
    console.log("Error: No coupon code provided.");
    return { valid: false, discount: 0, reason: "No code provided" };
}

if (coupon === "SUI_LAMBDA") {
    console.log("Valid coupon! Applying 50% serverless discount.");
    return { valid: true, discount: 0.5, code: "SUI_LAMBDA" };
}

if (coupon === "V8_SANDBOX") {
    console.log("Valid coupon! Applying 30% secure sandbox discount.");
    return { valid: true, discount: 0.3, code: "V8_SANDBOX" };
}

if (coupon === "ANTIGRAVITY") {
    console.log("Valid coupon! Applying 99% developer discount!");
    return { valid: true, discount: 0.99, code: "ANTIGRAVITY" };
}

console.log("Invalid coupon code: " + coupon);
return { valid: false, discount: 0, reason: "Coupon not found in project ruleset" };

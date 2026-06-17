// functions/coupon_validator.js
// Live Serverless Coupon Validation Isolate for SuiNode Store

console.log("----------------------------------------");
console.log("🎟️ DECENTRALIZED COUPON VALIDATION RUNNER");
console.log("----------------------------------------");

const input = globalThis.input || {};
const couponHash = (input.couponHash || "").trim().toLowerCase();

console.log("Validating coupon hash: " + couponHash);

if (!couponHash) {
    console.log("Error: No coupon hash provided.");
    return { valid: false, discount: 0, reason: "No code provided" };
}

// 391ba47fb55bc5d6cdf724c5ca70dc72b8e2fc5faa142cd3ce5d33bf026f907f = SUI_LAMBDA
if (couponHash === "391ba47fb55bc5d6cdf724c5ca70dc72b8e2fc5faa142cd3ce5d33bf026f907f") {
    console.log("Valid coupon! Applying 50% serverless discount.");
    return { valid: true, discount: 0.5 };
}

// 2a190f1f4ee254083b7922af1b8dcc51de2066e5f0c44861a0a6048e82108b6c = V8_SANDBOX
if (couponHash === "2a190f1f4ee254083b7922af1b8dcc51de2066e5f0c44861a0a6048e82108b6c") {
    console.log("Valid coupon! Applying 30% secure sandbox discount.");
    return { valid: true, discount: 0.3 };
}

// 6ae41f1bcbb9eb70f96e76c38365a446c84ac8bb71fb78484a93bce3d25cf330 = ANTIGRAVITY
if (couponHash === "6ae41f1bcbb9eb70f96e76c38365a446c84ac8bb71fb78484a93bce3d25cf330") {
    console.log("Valid coupon! Applying 99% developer discount!");
    return { valid: true, discount: 0.99 };
}

console.log("Invalid coupon hash: " + couponHash);
return { valid: false, discount: 0, reason: "Coupon not found in project ruleset" };

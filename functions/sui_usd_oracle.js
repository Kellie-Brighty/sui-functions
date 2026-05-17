// functions/sui_usd_oracle.js
// Real-time SUI/USD Price Feed Oracle for Sui-Functions

console.log("----------------------------------------");
console.log("📈 SUI/USD PRICE FEED ORACLE: STARTING FETCH");
console.log("----------------------------------------");

async function fetchSuiPrice() {
    // Try Coinbase
    try {
        const res = await fetch("https://api.coinbase.com/v2/prices/SUI-USD/spot");
        const data = await res.json();
        const price = parseFloat(data.data.amount);
        if (!isNaN(price) && price > 0) return price;
    } catch (e) {
        console.log("[Oracle Sandbox] Coinbase fetch failed, trying CryptoCompare...");
    }

    // Try CryptoCompare
    try {
        const res = await fetch("https://min-api.cryptocompare.com/data/price?fsym=SUI&tsyms=USD");
        const data = await res.json();
        const price = parseFloat(data.USD);
        if (!isNaN(price) && price > 0) return price;
    } catch (e) {
        console.log("[Oracle Sandbox] CryptoCompare fetch failed, trying CoinGecko...");
    }

    // Try CoinGecko
    try {
        const res = await fetch("https://api.coingecko.com/api/v3/simple/price?ids=sui&vs_currencies=usd");
        const data = await res.json();
        const price = parseFloat(data.sui.usd);
        if (!isNaN(price) && price > 0) return price;
    } catch (e) {
        console.log("[Oracle Sandbox] CoinGecko fetch failed.");
    }

    throw new Error("All SUI/USD price API providers failed inside sandbox");
}

try {
    const price = await fetchSuiPrice();
    console.log("Fetched Price successfully: SUI = $" + price + " USD");
    
    return {
        status: "success",
        asset: "SUI/USD",
        price: price,
        timestamp: new Date().toISOString()
    };
} catch (error) {
    console.log("Price fetch failed: " + error.message);
    return {
        status: "error",
        message: error.message
    };
}

async function getLogsDirect() {
    const rpcUrl = "https://polygon-amoy-bor-rpc.publicnode.com";
    const exchangeAddress = "0xe302CA1137bC0BEe3A1A615C485b8Bc54262D47f";
    const topic = "0xdf3f7279dedf7bddfcfbc4db9c4e29de1728f1ab97388ad9aaf887f62c7c186e"; // TradeExecuted

    // Search around May 8.
    // Block 38,000,000 to 39,000,000
    const startBlock = 38000000;
    const endBlock = 39000000;
    const step = 1000;

    for (let from = startBlock; from < endBlock; from += step) {
        const to = Math.min(from + step - 1, endBlock);
        console.log(`Checking ${from} to ${to}...`);
        try {
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    jsonrpc: "2.0",
                    method: "eth_getLogs",
                    params: [{
                        address: exchangeAddress,
                        fromBlock: "0x" + from.toString(16),
                        toBlock: "0x" + to.toString(16),
                        topics: [topic]
                    }],
                    id: 1
                })
            });
            const data = await response.json();
            if (data.error) {
                console.error("Error:", data.error.message);
                if (data.error.message.includes("pruned")) {
                    // Skip pruned
                }
            } else if (data.result && data.result.length > 0) {
                console.log(`FOUND ${data.result.length} logs in ${from}-${to}`);
                console.log(JSON.stringify(data.result, null, 2));
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    }
}
getLogsDirect();

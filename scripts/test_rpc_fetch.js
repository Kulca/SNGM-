async function testRpc() {
    const rpcUrl = "https://polygon-amoy-bor-rpc.publicnode.com";
    try {
        const response = await fetch(rpcUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                jsonrpc: "2.0",
                method: "eth_chainId",
                params: [],
                id: 1
            })
        });
        const text = await response.text();
        console.log("Response:", text);
    } catch (err) {
        console.error("Fetch error:", err);
    }
}
testRpc();

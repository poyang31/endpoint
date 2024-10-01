export default {
    async fetch(req, env) {
        // Deny Browsers
        const userAgent = req.headers.get("user-agent");
        if (userAgent?.startsWith("Mozilla")) {
            return new Response("Endpoint: Forbidden", {
                status: 403,
            });
        }

        // For Update
        const secret = req.headers.get("x-endpoint-secret");
        const dstUrl = req.headers.get("x-endpoint-url");
        if (dstUrl) {
            if (secret !== env.ENDPOINT_TUNNEL_SECRET) {
                return new Response("Endpoint: Bad Gateway", {
                    status: 502,
                });
            }
            await env.KV.put("ENDPOINT_TUNNEL_URL", dstUrl);
            return new Response(null, {
                status: 204,
            });
        }

        // Check URL
        const endpointUrl = await env.KV.get("ENDPOINT_TUNNEL_URL");
        if (!endpointUrl) {
            return new Response("Endpoint: Bad Gateway", {
                status: 502,
            });
        }

        // Modify URL
        const proxyUrl = new URL(req.url);
        const proxyDst = new URL(endpointUrl);

        proxyUrl.protocol = proxyDst.protocol;
        proxyUrl.host = proxyDst.host;
        proxyUrl.port = proxyDst.port;

        // Modify Request
        req.headers.set("host", proxyDst.host);

        // Process Request
        const res = await fetch(proxyUrl, req);

        // Modify Response
        res.headers.set("x-endpoint-url", endpointUrl);

        // Return Response
        return res;
    },
};

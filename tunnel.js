"use strict";

require("dotenv").config();

const axios = require("axios");
const localtunnel = require("localtunnel");

const endpointUrl = process.env.ENDPOINT_URL;
const endpointSecret = process.env.ENDPOINT_SECRET;

(async () => {
    const tunnel = await localtunnel({ port: 80 });
    tunnel.on("close", () => {
        const timestamp = new Date().toLocaleString();
        console.log(`Tunnel closed: ${timestamp}`);
    });
    console.log(`Tunnel Status: ${tunnel.url}`);

    const worker = await axios.get(endpointUrl, {
        headers: {
            "x-endpoint-secret": endpointSecret,
            "x-endpoint-url": tunnel.url
        },
        validateStatus: (status) => status !== 0,
    });
    console.log(`Worker Status: ${worker.status}`);
})();

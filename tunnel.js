"use strict";

require("dotenv").config();

const axios = require('axios');
const localtunnel = require('localtunnel');

const endpointUrl = process.env.ENDPOINT_URL;
const endpointSecret = process.env.ENDPOINT_SECRET;

(async () => {
    const tunnel = await localtunnel({ port: 80 });
    tunnel.on('close', () => {
        console.log('Tunnel closed');
    });

    const result = await axios.get(endpointUrl, {
        headers: {
            "x-endpoint-secret": endpointSecret,
            "x-endpoint-url": tunnel.url
        },
    });
    console.log(`Update Status: ${result.status}`);
})();

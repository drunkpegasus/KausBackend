const https = require('https'); // Use the 'https' module for HTTPS requests

const targetServiceURL = 'https://fishy.herokuapp.com';

function keepAlive() {
  https.get(targetServiceURL, (res) => {
    console.log(`Pinged ${targetServiceURL}`);
  });
}

// ping interval
const pingInterval = 27 * 60 * 1000;
setInterval(keepAlive, pingInterval);

keepAlive();

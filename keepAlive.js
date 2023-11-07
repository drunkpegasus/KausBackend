const http = require('http');

const targetServiceURL = 'https://fishy.herokuapp.com'; 

function keepAlive() {

  http.get(targetServiceURL, (res) => {
    console.log(`Pinged ${targetServiceURL}`);
  });
}

// ping interval
const pingInterval = 27 * 60 * 1000;
setInterval(keepAlive, pingInterval);

keepAlive();

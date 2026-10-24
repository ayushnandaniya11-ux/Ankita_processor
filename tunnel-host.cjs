const net = require('net');

const clientPort = 5433;
const bridgePort = 54331;

const pool = [];
const waitingClients = [];

// Bridge server: accepts connections from WSL
const bridgeServer = net.createServer((wslSocket) => {
  wslSocket.on('error', () => {});
  
  if (waitingClients.length > 0) {
    const clientSocket = waitingClients.shift();
    pair(clientSocket, wslSocket);
  } else {
    pool.push(wslSocket);
  }

  wslSocket.on('close', () => {
    const idx = pool.indexOf(wslSocket);
    if (idx !== -1) pool.splice(idx, 1);
  });
});

bridgeServer.listen(bridgePort, '0.0.0.0', () => {
  console.log(`[Bridge Server] Listening on 0.0.0.0:${bridgePort} for WSL tunnel agent`);
});

// Client server: accepts connections from AdonisJS / pg
const clientServer = net.createServer((clientSocket) => {
  clientSocket.on('error', () => {});

  if (pool.length > 0) {
    const wslSocket = pool.shift();
    pair(clientSocket, wslSocket);
  } else {
    waitingClients.push(clientSocket);
  }
});

clientServer.listen(clientPort, '127.0.0.1', () => {
  console.log(`[Postgres Proxy] Listening on 127.0.0.1:${clientPort} for PostgreSQL clients`);
});

function pair(client, wsl) {
  client.pipe(wsl);
  wsl.pipe(client);
  client.on('error', () => wsl.destroy());
  wsl.on('error', () => client.destroy());
  client.on('close', () => wsl.destroy());
  wsl.on('close', () => client.destroy());
}

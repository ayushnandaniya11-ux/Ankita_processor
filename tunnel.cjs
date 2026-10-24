const net = require('net');
const { execSync } = require('child_process');

let wslIp = '172.20.208.29';
try {
  wslIp = execSync('wsl -d Ubuntu hostname -I').toString().trim().split(' ')[0] || wslIp;
} catch (e) {
  console.error('Failed to get WSL IP, falling back to default:', e.message);
}

const server = net.createServer((clientSocket) => {
  const pgSocket = net.connect(5433, wslIp);
  clientSocket.pipe(pgSocket);
  pgSocket.pipe(clientSocket);

  clientSocket.on('error', () => pgSocket.destroy());
  pgSocket.on('error', () => clientSocket.destroy());
});

server.listen(5433, '127.0.0.1', () => {
  console.log(`[Postgres Proxy] Listening on 127.0.0.1:5433 -> ${wslIp}:5433`);
});

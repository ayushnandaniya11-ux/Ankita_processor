const net = require('net');

const targetHost = '127.0.0.1';
const targetPort = 5433; // Postgres in WSL
const bridgeHost = '172.20.208.1'; // Windows host IP from WSL
const bridgePort = 54331;
const TARGET_POOL_SIZE = 5;

let currentIdleSockets = 0;

function createSpareConnection() {
  if (currentIdleSockets >= TARGET_POOL_SIZE) return;
  currentIdleSockets++;

  const bridgeConn = net.connect(bridgePort, bridgeHost);

  let isPaired = false;

  bridgeConn.on('error', (err) => {
    if (!isPaired) {
      currentIdleSockets--;
      setTimeout(createSpareConnection, 1000);
    }
  });

  bridgeConn.once('data', (firstChunk) => {
    isPaired = true;
    currentIdleSockets--;
    // Immediately replenish pool by 1
    createSpareConnection();

    // Connect to PostgreSQL
    const pgConn = net.connect(targetPort, targetHost, () => {
      pgConn.write(firstChunk);
      bridgeConn.pipe(pgConn);
      pgConn.pipe(bridgeConn);
    });

    pgConn.on('error', () => {
      bridgeConn.destroy();
    });

    bridgeConn.on('error', () => {
      pgConn.destroy();
    });

    pgConn.on('close', () => {
      bridgeConn.destroy();
    });

    bridgeConn.on('close', () => {
      pgConn.destroy();
    });
  });

  bridgeConn.on('close', () => {
    if (!isPaired) {
      currentIdleSockets--;
      setTimeout(createSpareConnection, 500);
    }
  });
}

function initPool() {
  for (let i = 0; i < TARGET_POOL_SIZE; i++) {
    createSpareConnection();
  }
}

console.log(`[WSL Tunnel Agent] Connecting to Windows bridge at ${bridgeHost}:${bridgePort}...`);
initPool();

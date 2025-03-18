const WebSocket = require('ws');

const server = new WebSocket.Server({ port: 8080 });

let resources = { "Room 1": "Available", "Room 2": "Available" };

server.on('connection', (socket) => {
  console.log('A new client connected.');
  
  socket.send(JSON.stringify(resources));

  socket.on('message', (data) => {
    try {
      const { user, resource } = JSON.parse(data);
      
      if (!resources.hasOwnProperty(resource)) {
        socket.send(JSON.stringify({ error: `Invalid resource: ${resource}` }));
        return;
      }

      if (resources[resource] === "Available") {
        resources[resource] = `Booked by ${user}`;
        broadcast(JSON.stringify(resources));
      } else {
        socket.send(JSON.stringify({ error: `Sorry, ${resource} is already booked.` }));
      }
    } catch (err) {
      socket.send(JSON.stringify({ error: 'Invalid message format.' }));
    }
  });

  socket.on('close', () => console.log('A client disconnected.'));
});

function broadcast(data) {
  server.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(data);
    }
  });
}

console.log('WebSocket server running on ws://localhost:8080');

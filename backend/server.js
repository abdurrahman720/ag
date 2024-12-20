import express from 'express';
import { Server } from 'socket.io';
import { createServer } from 'http';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5175",
    methods: ["GET", "POST"]
  }
});

// Store raised hands with agent info and help text
const raisedHands = new Map(); // agentId -> { name, helpText, timestamp }
// Track which closer is handling which agent
const closerAssignments = new Map(); // closerId -> { agentId, closerName }
// Track which agents are being helped
const agentAssignments = new Map(); // agentId -> { closerId, closerName }

io.on('connection', (socket) => {
  // Send current state to newly connected clients
  console.log("socket connected to", socket.id)
  socket.emit('initialState', {
    raisedHands: Array.from(raisedHands.entries()).map(([agentId, data]) => ({
      agentId,
      ...data
    }))
  });

  socket.on('raiseHand', ({ agentId, name, helpText }) => {
    // Only allow raising hand if not already being helped
    if (!agentAssignments.has(agentId) && !raisedHands.has(agentId)) {
      const handData = {
        name,
        helpText,
        timestamp: Date.now()
      };
      raisedHands.set(agentId, handData);
      io.emit('handRaised', {
        agentId,
        ...handData
      });
    }
  });

  socket.on('closerJoin', ({ closerId, closerName, agentId }) => {
    // Check if closer is already helping someone
    if (!closerAssignments.has(closerId)) {
      // Check if agent is still available
      if (raisedHands.has(agentId) && !agentAssignments.has(agentId)) {
        // Get agent info before removing from raised hands
        const agentInfo = raisedHands.get(agentId);

        // Assign the agent to the closer
        closerAssignments.set(closerId, { agentId, closerName });
        agentAssignments.set(agentId, { closerId, closerName });

        // Remove from raised hands
        raisedHands.delete(agentId);

        // Notify everyone about the assignment
        io.emit('requestAccepted', {
          closerId,
          closerName,
          agentId,
          agentName: agentInfo.name
        });
      }
    }
  });

  socket.on('cancelRequest', ({ agentId }) => {
    // Remove the request
    raisedHands.delete(agentId);

    // If agent was assigned to a closer, clear that assignment
    if (agentAssignments.has(agentId)) {
      const { closerId } = agentAssignments.get(agentId);
      closerAssignments.delete(closerId);
      agentAssignments.delete(agentId);
    }

    // Notify everyone about the cancellation
    io.emit('requestCancelled', { agentId });
  });

  socket.on('completeRequest', ({ closerId, agentId }) => {
    // Verify the closer is actually helping this agent
    if (closerAssignments.has(closerId) && closerAssignments.get(closerId).agentId === agentId) {
      // Clear assignments
      closerAssignments.delete(closerId);
      agentAssignments.delete(agentId);

      // Notify everyone
      io.emit('requestCompleted', { closerId, agentId });
    }
  });

  // Handle disconnects
  socket.on('disconnect', () => {
    // Clean up could be added here if needed
  });
});

server.listen(5005, () => {
  console.log('Server running on port 5005');
});

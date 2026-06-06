import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

interface SSEClient {
  id: string;
  res: Response;
}

// In-memory list of active SSE connections
const clients: Map<string, SSEClient> = new Map();

/**
 * Registers a new SSE client.
 * Fix #3: Attaches a 'close' listener to auto-remove the client on disconnect.
 * Fix #6: Manually sets CORS + SSE headers (cors() middleware can strip them from streams).
 */
export function addClient(res: Response): string {
  const id = uuidv4();

  // Fix #6 — manual CORS + SSE headers on stream response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.flushHeaders(); // Flush headers to establish SSE connection immediately

  clients.set(id, { id, res });
  console.log(`SSE client connected [${id}] — total: ${clients.size}`);

  // Send initial heartbeat so the client knows the stream is live
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId: id })}\n\n`);

  // Fix #3 — remove client from map when browser disconnects
  res.on('close', () => {
    clients.delete(id);
    console.log(`SSE client disconnected [${id}] — total: ${clients.size}`);
  });

  return id;
}

/**
 * Broadcasts a JSON payload to ALL connected SSE clients.
 */
export function broadcast(payload: object): void {
  const data = `data: ${JSON.stringify(payload)}\n\n`;

  clients.forEach(({ id, res }) => {
    try {
      res.write(data);
    } catch (err) {
      // Client may have disconnected between the close event and now
      console.warn(`Failed to write to client [${id}], removing.`);
      clients.delete(id);
    }
  });
}

/**
 * Returns the number of currently connected SSE clients.
 */
export function clientCount(): number {
  return clients.size;
}

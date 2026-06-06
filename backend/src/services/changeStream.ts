import fs from 'fs';
import path from 'path';
import { ChangeStreamDocument } from 'mongodb';
import { Order } from '../models/Order';
import { broadcast } from './sseManager';


const TOKEN_FILE = path.resolve(__dirname, '../../resumeToken.json');

let isRunning = false;
let changeStream: Awaited<ReturnType<typeof Order.watch>> | null = null;

/**
 * Loads the last saved resume token from disk.
 * Fix #5: Resume tokens allow the stream to catch up on missed events after restart.
 */
function loadResumeToken(): object | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const raw = fs.readFileSync(TOKEN_FILE, 'utf-8');
      const token = JSON.parse(raw);
      console.log('Resume token loaded — will catch up from last position');
      return token;
    }
  } catch {
    console.warn('Could not load resume token, starting fresh');
  }
  return null;
}

/**
 * Persists the latest resume token to disk.
 */
function saveResumeToken(token: object): void {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(token), 'utf-8');
  } catch (err) {
    console.warn('Could not save resume token:', err);
  }
}

/**
 * Starts the MongoDB Change Stream on the orders collection.
 * Fix #4: Called only inside mongoose.connection.once('open') — DB is guaranteed ready.
 * Fix #5: Loads resume token so missed events are replayed after restart.
 */
export function startChangeStream(): void {
  if (isRunning) return;
  isRunning = true;

  const resumeToken = loadResumeToken();
  const options = resumeToken
    ? { fullDocument: 'updateLookup' as const, resumeAfter: resumeToken }
    : { fullDocument: 'updateLookup' as const };

  // Watch all operations: insert, update, replace, delete
  changeStream = Order.watch([], options);

  changeStream.on('change', (event: ChangeStreamDocument) => {
    if (event._id) {
      saveResumeToken(event._id as object);
    }

    let payload: object;

    switch (event.operationType) {
      case 'insert':
        payload = { type: 'insert', data: event.fullDocument };
        break;

      case 'update':
      case 'replace':
        payload = { type: 'update', data: event.fullDocument };
        break;

      case 'delete':
        payload = { type: 'delete', data: { _id: event.documentKey._id } };
        break;

      default:
        return; // Ignore drop, rename, etc.
    }

    console.log(`📡 Change detected [${event.operationType}] → broadcasting to SSE clients`);
    broadcast(payload);
  });

  changeStream.on('error', (err) => {
    console.error('Change stream error:', err);
    isRunning = false;
  });

  changeStream.on('close', () => {
    console.log('Change stream closed');
    isRunning = false;
  });

  console.log('Change stream watching orders collection...');
}

/**
 * Closes the change stream cursor.
 * Fix #7: Called during SIGINT for graceful shutdown.
 */
export async function closeStream(): Promise<void> {
  if (changeStream) {
    await changeStream.close();
    changeStream = null;
    console.log('Change stream closed');
  }
}

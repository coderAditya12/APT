import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { mongoose, connectDB, disconnectDB } from './db/db';
import orderRoutes from './routes/orderRoutes';
import { startChangeStream, closeStream } from './services/changeStream';

const PORT = process.env.PORT || 3000;

// ── App ───────────────────────────────────────────────────────────────────────
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/orders', orderRoutes);
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// ── Bootstrap ─────────────────────────────────────────────────────────────────
async function start(): Promise<void> {
  try {
    await connectDB();
    if (mongoose.connection.readyState === 1) {
      startChangeStream();
    } else {
      mongoose.connection.once('open', startChangeStream);
    }

    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
  } catch (err) {
    console.error('Startup failed:', err);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await closeStream();
  await disconnectDB();
  console.log('Done');
  process.exit(0);
});

start();

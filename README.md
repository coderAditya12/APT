# Real-Time Order Updates System

A light weight, highly efficient real-time order tracking system built using **Node.js, Express, MongoDB (Mongoose)**, and **Server-Sent Events (SSE)**.

This system propagates database-level changes to clients immediately without relying on frequent polling, client-side timers, or heavy WebSocket connection states.

---

## System Architecture

```
┌─────────────────┐             ┌─────────────────┐             ┌─────────────────┐
│                 │   watch()   │                 │  SSE Stream   │                 │
│  MongoDB (Repl) ├────────────►│ Express Backend ├────────────►│  Browser/CLI    │
│  Change Stream  │             │   (Node.js)     │             │     Client      │
└─────────────────┘             └────────┬────────┘             └─────────────────┘
                                         │
                                         ▼ (REST API)
                                CRUD Operations
```

1. **DB to Backend (MongoDB Change Streams):** The Node.js backend watches the MongoDB oplog in real time. Any `insert`, `update`, or `delete` operation on the `orders` collection triggers a database event.
2. **Backend to Client (Server-Sent Events):** The backend streams events to connected clients over a single HTTP connection using standard Server-Sent Events (SSE).

---

## Why This Architecture? (Design Decisions)

### 1. MongoDB Change Streams vs. Database Triggers/Polling
* **No Polling:** Traditional polling wastes database resources and introduces latency. Change Streams push updates instantly.
* **Database-agnostic capture:** Unlike application-level event emitters, Change Streams capture **all** mutations, even if they are executed directly in the database (e.g., via MongoDB Compass, scripts, or other services).
* **Built-in Resilience (Resume Tokens):** Change Streams return a resume token with every event. If the backend server restarts, it reads the last saved token from disk (`resumeToken.json`) and continues the stream from that exact position, ensuring no updates are lost.

### 2. Server-Sent Events (SSE) vs. WebSockets
* **Unidirectional simplicity:** The system requirements are strictly push-based (server-to-client). SSE is built specifically for one-way streaming.
* **Native browser support:** SSE uses the browser's built-in `EventSource` API, requiring no external client-side libraries.
* **Automatic Reconnection:** If the connection drops, browsers automatically attempt to reconnect to SSE endpoints without custom client-side retry logic.
* **HTTP/2 Friendly:** SSE operates over standard HTTP, making it simpler to configure with reverse proxies, firewalls, and load balancers compared to WebSockets.

---

## Technical Features Implemented

* **Snake_case timestamps:** Mongoose schema is configured with `timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }` to match the exact schema specifications.
* **No Route Conflicts:** The stream endpoint `/api/orders/stream` is registered before parametric ID routes (`/api/orders/:id`) to prevent Express from misinterpreting `stream` as a database ID.
* **Graceful Cleanups:** The server monitors client disconnects (`req.on('close')`) to remove inactive response streams, avoiding memory leaks.
* **Graceful Shutdown:** The server intercepts `SIGINT` (Ctrl+C) to safely close the change stream cursor before disconnecting the database.

---

## How to Run the System

### Prerequisites
* [Docker](https://www.docker.com/) and [Docker Compose](https://docs.docker.com/compose/)
* [Node.js](https://nodejs.org/) (v18+ recommended)
* npm

### Step 1: Start MongoDB (Replica Set)
MongoDB Change Streams require a replica set configuration. Run the provided docker-compose configuration to spin up a single-node replica set:
```bash
docker compose up -d
```
This starts MongoDB on port `27017` and automatically runs `rs.initiate()`.

### Step 2: Install Backend Dependencies
Navigate to the backend directory and install:
```bash
cd backend
npm install
```

### Step 3: Run the Backend
Start the backend server in development mode (using nodemon and ts-node):
```bash
npm run dev
```
The server will start at `http://localhost:3000`.

### Step 4: Run the Client UI
To run the static frontend, you can serve the `client/` folder using any static web server (such as `serve` or Python's HTTP server):
```bash
# Using npx
npx serve client -l 4000

# Or using Python 3
cd client && python3 -m http.server 4000
```
Open `http://localhost:4000` in your web browser.

---

## Testing API Endpoints

### 1. Connect to SSE Stream
```bash
curl -N http://localhost:3000/api/orders/stream
```

### 2. Fetch All Orders
```bash
curl http://localhost:3000/api/orders
```

### 3. Create a New Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{"customer_name": "Bruce Wayne", "product_name": "Batarang", "status": "pending"}'
```

### 4. Update Order Status
```bash
curl -X PATCH http://localhost:3000/api/orders/<ORDER_ID> \
  -H "Content-Type: application/json" \
  -d '{"status": "shipped"}'
```

### 5. Delete an Order
```bash
curl -X DELETE http://localhost:3000/api/orders/<ORDER_ID>
```

---

## Horizontal Scalability Note

If this system needs to scale across multiple instances:
* **Current Limiting Factor:** Client SSE connections are stored in-memory on individual server nodes.
* **Scaling Solution:** Use **Redis Pub/Sub** to bridge instances. When MongoDB Change Streams emit a database change, the instance receiving the event publishes it to a Redis channel. Every backend server instance subscribes to this Redis channel and broadcasts incoming events to their locally connected SSE clients. This allows horizontal scaling of the Express application layer seamlessly.

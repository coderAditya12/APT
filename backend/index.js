// import express from "express"
// import {EventEmitter} from 'events'
// const app = express()
// const eventBus = new EventEmitter()
// app.post("/send",(req,res)=>{
//     const customeMessage = req.body?.message || "Hello from the server!"
//     eventBus.emit("new-alert", {
//         time:new Date().toLocaleTimeString(),
//         message:customeMessage
//     })
//     res.json({status:"Message sent"})


// })

// app.get("/events",(req,res)=>{
//     res.setHeader('content-type','text/event-stream')
//     res.setHeader('cache-control','no-cache')
//     res.setHeader('connection','keep-alive')

//     res.write(`data:connected to server\n\n`)
    
//     // const intervalId = setInterval(()=>{
//     //     const time = new Date().toLocaleTimeString()
//     //     res.write(`data:Current time is ${time}\n\n`)

//     // },2000)
//     const sendEventToClient = (data)=>{
//         res.write(`data:${JSON.stringify(data)}\n\n`)
//     }
//     eventBus.on("new-alert",sendEventToClient)

//     // req.on('close',()=>{
//     //     clearInterval(intervalId)
//     // })

// })

// app.listen(3000,()=>{
//     console.log("Server is running on port 3000")
// })

import express from "express";
import { EventEmitter } from "events";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

const eventBus = new EventEmitter();

// 1. The SSE Route (The Listener)
app.get("/events/:userId", (req, res) => {
    const userId = req.params.userId;

    res.setHeader('content-type', 'text/event-stream');
    res.setHeader('cache-control', 'no-cache');
    res.setHeader('connection', 'keep-alive');
    res.flushHeaders();

    res.write(`data: ${JSON.stringify({ message: `System: Connected as ${userId}` })}\n\n`);

    const sendToClient = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    // TRICK: We create a unique event name just for this user!
    const personalEventName = `notify-${userId}`;
    eventBus.on(personalEventName, sendToClient);

    req.on('close', () => {
        eventBus.off(personalEventName, sendToClient);
        console.log(`${userId} disconnected.`);
    });
});

// 2. The Trigger Route (The Sender)
app.post("/send-request", (req, res) => {
    const fromUser = req.body.fromUser;
    const toUser = req.body.toUser;

    if (!fromUser || !toUser) {
        return res.status(400).json({ error: "fromUser and toUser are required" });
    }

    // We emit the event ONLY to the specific user's channel
    eventBus.emit(`notify-${toUser}`, {
        message: `🔔 New Friend Request from ${fromUser}!`
    });

    res.json({ status: "Sent!" });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running! Open http://localhost:${port} in your browser.`);
});

import express from "express"
import {EventEmitter} from 'events'
const app = express()
const eventBus = new EventEmitter()
app.post("/send",(req,res)=>{
    const customeMessage = req.body?.message || "Hello from the server!"
    eventBus.emit("new-alert", {
        time:new Date().toLocaleTimeString(),
        message:customeMessage
    })
    res.json({status:"Message sent"})
    

})

app.get("/events",(req,res)=>{
    res.setHeader('content-type','text/event-stream')
    res.setHeader('cache-control','no-cache')
    res.setHeader('connection','keep-alive')

    res.write(`data:connected to server\n\n`)
    
    // const intervalId = setInterval(()=>{
    //     const time = new Date().toLocaleTimeString()
    //     res.write(`data:Current time is ${time}\n\n`)

    // },2000)
    const sendEventToClient = (data)=>{
        res.write(`data:${JSON.stringify(data)}\n\n`)
    }
    eventBus.on("new-alert",sendEventToClient)

    // req.on('close',()=>{
    //     clearInterval(intervalId)
    // })

})

app.listen(3000,()=>{
    console.log("Server is running on port 3000")
})
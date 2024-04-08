const express =require("express")
const cors=require("cors")
const router=require("./Router/Route")
const app=express();
const http = require("http");
const {Server}=require("socket.io");
const server=http.createServer(app);
const dotenv = require("dotenv")

app.use(express.json())
app.use(cors())
app.use(router);

const io=new Server(server,{
    cors:{
        origin:"http://localhost:3000",
        methods:["GET","POST"],
    }
})
io.on("connection",(socket)=>{
    console.log(`user connected:${socket.id}`);
    socket.on("join_room",(data)=>{
        socket.join(data);
        console.log(`user with id:${socket.id} joined room :${data}`);
    })
    socket.on("send_message",(data)=>{
        socket.to(data.room).emit("receive_message",data);
    })
    socket.on("disconnect",()=>{
        console.log("user disconnect",socket.id);
    });
});
server.listen(3000,()=>{
    console.log("Server Running");
})

dotenv.config({path:"./config.env"}) 
const port=process.env.port; 

app.listen(port,()=>{
    console.log("connection done with server 7500");
});
const express=require("express")
const Data=require("../Model/data")
const Messages=require("../Model/message.js")
const route=express.Router();
require("../DB/cont");

route.get("/",(req,res)=>{
    res.send("Home page");
})
route.post("/adduser",async(req,res)=>{
    try{
        const {name,yourid,otherid}=req.body;
        let user=new Data({name,yourid,otherid})
        await user.save();
        res.send("user add")
    }
    catch(e){
        console.log(e)
    }
}) 
route.post("/saveMessage", async (req, res) => {
    try {
      const { messages, author, time } = req.body;
      const newMessage = new Messages({ messages, author, time: Date.now() });
      await newMessage.save();
      res.send("Message saved successfully");
    } catch (error) {
      console.error('Error saving message:', error);
      res.status(500).send('Error saving message');
    }
  });
route.get("/usershow", async(req,res)=>{
    try{
        let data=await Data.find();
        res.send(data);
    }
    catch(e){
        console.log(e);
    }
})
route.delete("/removeUser/:name",async(req,res)=>{
    try{
        console.log(req.params);
        const {name}=req.params;
        const data=await Data.findOneAndDelete({name:name});
        res.send("removed");
    }
    catch(e){
        console.log(e);
    }
})
route.put("/editUser/:name", async(req,res)=>{
    try{
        let {name}=req.params;
        await Data.findOneAndUpdate({name:name},req.body,{new:true})
        res.send("updated...")
    }
    catch(e){
        console.log(e)
    }
})

module.exports=route;
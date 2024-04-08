const mongoose=require("mongoose");
const messages=new mongoose.Schema({

    message:{type:String},
    author:{type:String},
    time:{type:Number}
});
const Messages= new mongoose.model("Messages",messages);
module.exports=Messages;


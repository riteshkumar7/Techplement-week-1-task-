const mongoose=require("mongoose");
const data=new mongoose.Schema({

    name:{type:String},
    yourid:{type:Number},
    otherid:{type:Number}
});
const Data= new mongoose.model("Data",data);
module.exports=Data;
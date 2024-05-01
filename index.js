import express from "express";
import cors from "cors";
import './db/connectDB.js';
import dotenv  from "dotenv"
import connectToMongoDB from "./db/connectDB.js";
import mongoose from "mongoose";
import   Jwt  from "jsonwebtoken";
import  verify from "jsonwebtoken";
import asyncHandler from 'express-async-handler'
const app=express();
dotenv.config()
const PORT=process.env.PORT


//db connection
connectToMongoDB(process.env.DATABASE)
  .then(()=> console.log("connected to db.."))
  .catch((err)=>console.log(`connection error:${err}`))


//middlewares
app.use(cors());
app.use(express.json());
const protect=asyncHandler(async(req,res,next)=>{
    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        try {
            token=req.headers.authorization.split(' ')[1]
            const decoded=Jwt.verify(token,"SecretKey")
            req.user=await user.findById(decoded.id).select('-password')
            next()
        } catch (error) {
            console.log(error)
            res.status(401)
            throw new Error("not authorized")
        }
    }
    if(!token){
        res.status(401)
        throw new Error('Not authorized no token')
    }
})

//controlers
function generateToken(id){
    return    Jwt.sign({id},"SecretKey",{
            expiresIn: "30d"
            })
    }

//schema
const userSchema =new mongoose.Schema({
    name:{type :String , required:true},
    email:{type :String, required:true},
    password:{type:String, required:true},
    password:{type:String, required:true},
});const user=mongoose.model('user' , userSchema);

const courseSchema = new mongoose.Schema({
  course: { type: String, required: true },
  year: { type: Number, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  link: { type: String, required: true },
});const notes = mongoose.model('test.notes', courseSchema); 

const roadmapSchema = new mongoose.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true },
    });const roadmap = mongoose.model('roadmaps', roadmapSchema);

const VideoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    link: { type: String, required: true },
    });const video = mongoose.model('video', VideoSchema);


  //routes
app.post("/register",async(req,res)=>{
    var name= String(req.body.name);
    var email =String(req.body.email);
    var password=String(req.body.password)
    try {
        const existUser= await user.findOne({email})
        if(existUser){
            return res.status(400).json({ msg: 'User already exists' });
        }
        
        const newUser=new user({
            name,email,password
         })
         await newUser.save();
         res.status(201).json({ 
             _id:newUser._id,
             name:name,
             email:email,
             token:generateToken(newUser._id)
         });
    }catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
  
})   

app.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const existUser = await user.findOne({ email });

        if (!existUser) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        const matchPassword = await existUser.password === password;

        if (!matchPassword) {
            return res.status(400).json({ msg: "Invalid Credentials" });
        }

        // If both email and password match, generate token and send it in response
        res.status(201).json({
            _id: existUser._id,
            name: existUser.name,
            email: existUser.email,
            token: generateToken(existUser._id)
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});


app.post("/me",protect,async(req,res)=>{
   const {_id,name,email} = await user.findById(req.user.id)
   res.status(200).json({
    
    id:_id,
    name,
    email
   })
})

app.post("/uploadNotes", async(req,res)=>
      { 
         var branch = String(req.body.branch);
         var type = String(req.body.type);
         var year= Number(req.body.year);
         var name = String(req.body.name);
         var link = String(req.body.link);
         var imglink = String(req.body.imglink);
         const newNote = new notes({
          course:branch,
          year: year,
          name: name,
          type:type,
          link: link,
          imgLink:imglink,
        });
         newNote.save();
        
         res.send("notes submitted")
      })

app.get("/notes",async(req,res)=>{
     notes.find({}).then((data)=>{
        res.send(data)
    })  
  });

app.get("/roadmaps", async(req, res)=>{
    roadmap.find({}).then((data)=>{
        res.send(data)
    })
});

app.get("/video",async (req,res)=>{
    video.find({}).then((data)=>{
        res.send(data)
    })
});


//server connection
app.listen(PORT,()=>{
    console.log(`Server is Running on PORT :${PORT}`)
});
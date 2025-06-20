const express=require("express");
const mongoose=require("mongoose");
const dotenv=require("dotenv");
const User=require("./models/user")
const Message= require("./models/message")
const jwt=require("jsonwebtoken");
const cors=require("cors");
const bodyParser = require("body-parser");
const cookieParser= require("cookie-parser");
const bcrypt =require("bcryptjs");
const ws =require("ws");
const fs = require("fs");

dotenv.config();

mongoose.connect(process.env.MONGO_URL)
 .then(() => console.log("DB Connected Successfully"))
    .catch( (error) => {
        console.log("DB Connection Failed");
        console.error(error);
        process.exit(1);
    });

const app=express();
app.use("/uploads",express.static(`${__dirname}/uploads`));
app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());


app.use(cors({
  origin: 'https://chatterly-web.onrender.com',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // if you need to send cookies or authentication headers
}));

const jwtsecret=process.env.JWT_SECRET;
const bcryptSalt=bcrypt.genSaltSync(10);

async function getUserDataFromRequest(req) {
  return new Promise((resolve,reject)=>{
      const token=req.cookies?.token;
  if(token){
  jwt.verify(token,jwtsecret,{},(err,userData)=>{
    if(err) throw err;
    resolve(userData);
  });
}else{
  reject("no token");
}
  });
  
}

function notifyAboutOnlinePeople () {
  [...wss.clients].forEach(client => {
    client.send(JSON.stringify({
      online: [...wss.clients].map(c => ({
        userId: c.userId,
        username: c.username
      }))
    }));
  });
}

app.get("/test",(req,res)=>{
    res.json('test ok');
});

app.get("/messages/:userId",async (req,res)=>{
  const {userId} = req.params;
  const userData= await getUserDataFromRequest(req);
  const ourUserId =userData.userId;
  const messages= await Message.find({
    sender:{$in:[userId,ourUserId]},
    recipient:{$in:[userId,ourUserId]},
  }).sort({createdAt:1});
  res.json(messages);
});

app.get("/people",async(req,res)=>{
const users=await User.find({},{"_id":1,username:1});
res.json(users);
});

app.get("/profile",(req,res)=>{
  const token=req.cookies?.token;
  if(token){
  jwt.verify(token,jwtsecret,{},(err,userData)=>{
    if(err) throw err;
    res.json(userData);
  });
} else{
    console.log("no token");
  res.status(401).json("no token");
}
});

app.post("/login",async(req,res)=>{
  const{username,password}=req.body;
  const foundUser =await User.findOne({username});
  if (foundUser){
   const passOk= bcrypt.compareSync(password,foundUser.password);
   if(passOk){
     jwt.sign({userId:foundUser._id,username},jwtsecret,{},(err,token)=>{
    if(err) throw err;
    res.cookie("token",token,{sameSite:"none",secure:true}).json({
      id: foundUser._id
    });
   });
   }
  }
});

app.post("/logout",(req,res)=>{
  res.cookie("token","",{sameSite:"none",secure:true}).json("ok");
})

app.post("/register",async(req,res)=>
{
  if (!req.body) {
    return res.status(400).send("No request body received");
  }
  const { username, password } = req.body;
  const hashedPassword=bcrypt.hashSync(password,bcryptSalt);
   const createdUser=await User.create({
    username,
    password:hashedPassword
  });
   jwt.sign({userId:createdUser._id,username},jwtsecret,{},(err,token)=>{
    if(err) throw err;
    res.cookie("token",token,{sameSite:"none",secure:true}).status(201).json({id: createdUser._id});
   });
});
const server =app.listen(process.env.PORT || 3000,()=>{
    console.log("Server started on port 3000");
    
});

const wss =new ws.WebSocketServer({server});
wss.on("connection",(connection,req)=>{

connection. timer = setInterval(() => {
connection.ping();
connection. deathTimer = setTimeout(() =>{
clearInterval(connection.timer);
connection. terminate();
notifyAboutOnlinePeople();
// console. log('dead');
}, 1000);
}, 5000);

connection.on('pong', () => {
clearTimeout(connection.deathTimer);
});
  // read username and id from the cookies for this connection
const cookies=req.headers.cookie;
if(cookies){
 const tokenCookieString= cookies.split(";").find(str=>str.startsWith("token"))
 if(tokenCookieString){
  const token=tokenCookieString.split("=")[1];
  if(token){
   jwt.verify(token,jwtsecret,{},(err,userData)=>{
    if (err) throw err;
    const {userId,username}=userData;
    connection.userId =userId;
    connection.username=username;
   }); 
  }
 }
}

connection.on("message",async (message)=>{
const messageData=JSON.parse(message.toString());
const {recipient,text,file}= messageData;
let filename =null;
if(file){
const parts = file.name.split(".");
const ext = parts[parts.length-1];
filename =Date.now() + "." + ext;
const path = `${__dirname}/uploads/${filename}`;
const bufferData =new Buffer.from(file.data.split(",")[1],"base64");
fs.writeFile(path,bufferData,() =>{
  console.log("file saved"+path);
  
});
}
if(recipient && (text || file)){
const messageDoc = await Message.create({
  sender:connection.userId,
  recipient,
  text,
  file: file ? filename : null,
 });
  [...wss.clients]
  .filter(c=> c.userId===recipient)
  .forEach(c=> {c.send(JSON.stringify({
    text,
    sender:connection.userId,
    recipient,
    file: file ? filename : null,
    _id:messageDoc._id,
  }));
});
}
});

// Notify everyone about online people(when someone connects)
notifyAboutOnlinePeople();
});
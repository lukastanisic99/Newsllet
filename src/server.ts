import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose, { Types } from 'mongoose'
import restRouter from './routers/rest.routes';
import Controller from './controller';
import { createServer } from 'http';
import LiveStream from './liveStream';
import Filter from './filter';
import ConcurrentRegex from './concurrentRegex';
import WebSocket from 'ws';

const connectionString:string = "mongodb://localhost:27017/Newsllet";
const app = express();
const server = createServer(app);
// const wss = new WebSocket.Server({server:server});

app.use(cors())
app.use(bodyParser.json({limit:'50mb'}))


mongoose.connect(connectionString);
const conn = mongoose.connection;
conn.once('open',()=>{
    console.log('Connection SUCCESS!');
    
});
conn.on('error',err=>{
    console.log("CONNECTION ERROR ----------------",err);
})

app.use('/rest',restRouter);

// wss.on('connection',(ws)=>{
//     console.log("Connected - WebSocket");
//     ws.send("Server said HELLO");
    
// })

server.listen(4000, () => console.log(`Express server running on port 4000`));

let l = LiveStream.getInstance();
l.init(server);

let c = Controller.getInstance();
c.init();

// let main =async ()=>{
//     try{
//         let c:ConcurrentRegex = new ConcurrentRegex();
//         await c.test("haha");
//     }
//     catch(e){
//         console.log(e);
//     }
//     console.log("eeeee");
// }
// main();



// setTimeout(()=>{
// c.stopAll();
// },5000);

// let filter=new Filter(new Types.ObjectId("6329d740d4381eae957bf59e"));
// let item={p:0};
// for(let i=0;i<100;i++){
//     item.p=i;
//     filter.persistItem(item,100);
// }
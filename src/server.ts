import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import restRouter from './routers/rest.routes';
import Controller from './controller';
import { createServer } from 'http';
import LiveStream from './liveStream';


const connectionString:string = "mongodb://localhost:27017/Newsllet";
const app = express();
const server = createServer(app);

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

server.listen(4000, () => console.log(`Express server running on port 4000`));

let l = LiveStream.getInstance();
l.init(server);

let c = Controller.getInstance();
c.init();

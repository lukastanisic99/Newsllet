import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose from 'mongoose'
import restRouter from './routers/rest.routes';
import Controller from './controller';

const connectionString:string = "mongodb://localhost:27017/Newsllet";
const app = express();

app.use(cors())
app.use(bodyParser.json({limit:'50mb'}))

mongoose.connect(connectionString);
const conn = mongoose.connection;
conn.once('open',()=>{
    console.log('Connection SUCCESS!');
    
});

app.use('/rest',restRouter);
app.listen(4000, () => console.log(`Express server running on port 4000`));


let c = new Controller();
c.init();

setTimeout(()=>{
c.stopAll();
},5000);
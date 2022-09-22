import express from 'express';
import cors from 'cors'
import bodyParser from 'body-parser'
import mongoose, { Types } from 'mongoose'
import restRouter from './routers/rest.routes';
import Controller from './controller';
import Filter from './filter';
import ConcurrentRegex from './concurrentRegex';

const connectionString:string = "mongodb://localhost:27017/Newsllet";
const app = express();

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
app.listen(4000, () => console.log(`Express server running on port 4000`));


let c = new Controller();
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
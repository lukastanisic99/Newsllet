import { Worker } from "worker_threads";

const workerPath="./dist/worker.js";

export class QueueElement{
    resolve:Function;
    str:string;
    ticket:number; //if event queue(loop) looks like this [front.... TimeOut .... onWorkerMessage(worker done) ... back] - so WorkerMessage won't pop() the queue the second time
    comand:string; //comand to execute in the worker
    constructor(resolve:Function,str:string,ticker:number,comand:string){
        this.resolve=resolve;
        this.str=str;
        this.ticket=ticker;
        this.comand=comand;
    }
}
class ConcurrentRegex {
    private regexWorker:Worker;
    private patterns:string[]=[];
    private timeout:number=10000; //default timeout 10s
    private queue:QueueElement[]=[];
    private ticket:number=0;

    constructor(){
        this.createWorker();
    }
    public addPattern(pattern:string){
        this.patterns.push(pattern);
        this.regexWorker.postMessage(["ADD_PATTERN",pattern]);
    }
    
    public addPatterns(patterns:string[]){
        for(let p of patterns)this.addPattern(p);
        this.regexWorker.postMessage(["ADD_PATTERNS",this.patterns]);
    }

    public async test(str:string):Promise<boolean>{
        let finished:boolean = false;
        let ticket = this.ticket++;
        return new Promise((resolve,reject)=>{
            let _resolve = (value)=>{
                finished=true;
                resolve(value);
            }
            
            this.queue.push(new QueueElement(_resolve,str,ticket,"TEST"));
            if(this.queue.length==1)this.signalWorker();

            setTimeout(async()=>{
                if(!finished){
                await this.TerminateAndRespawn();
                // console.log("terminate");
                this.popQueueFront();
                this.signalWorker();
                resolve(false);
                }
            },this.timeout)

        })
    }
    private signalWorker(){
        try{
            if(this.queue.length>0){
                let data = this.queue[0];
                this.regexWorker.postMessage([data.comand,data.str,data.ticket]);
            }
        }catch(e){
            console.log(e);
        }
    }
    private createWorker(){
        try{
            this.regexWorker = new Worker(workerPath);
            this.regexWorker.postMessage(["ADD_PATTERNS",this.patterns]);
            this.regexWorker.on("message",(data)=>{ //data = [bool,ticket]
            if(this.queue[0].ticket==data[1]){
                this.queue[0].resolve(data[0]);
                this.popQueueFront();
                this.signalWorker();
            }
            })
        }catch(e){
            console.log(e);
        }
    }
    private async TerminateAndRespawn(){
        await this.regexWorker.terminate();
        this.createWorker();
    }

    private popQueueFront(){
        this.queue.shift();
    }

}

export default ConcurrentRegex;
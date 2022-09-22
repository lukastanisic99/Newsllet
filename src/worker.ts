import { parentPort } from "worker_threads";
import { Regex } from "./filter";

var regexs:Regex[]=[]

try{

parentPort.on("message",(data)=>{
    let comand=data[0];
    switch (comand) {
        case "ADD_PATTERNS": //data = ["CREATE",[paterns]]
            addPatterns(data[1]);
            break;
        case "ADD_PATTERN": //data= ["ADD_PATTERN",patern]
        addPattern(data[1]);
            break;
        case "TEST": //data = ["TEST",str,ticket]
            let result = false;
            for(let reg of regexs){
                result=reg.regex.test(data[1]);
                if(result)break;
            }
            parentPort.postMessage([result,data[2]]); // [result,ticket];
            break;
        default:
            break;
    }
})

function addPattern(pattern:string){
    let r = new Regex(pattern);
    regexs.push(r);
}

function addPatterns(patterns:string[]){
    for(let p of patterns)addPattern(p);
}

}catch(e){
    console.log(e);
}
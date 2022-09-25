import WebSocket from 'ws';
import { Types } from "mongoose";
import { TextDecoder } from 'util';

type FilterIdString = string; //need this for Key

class LiveStream {
    private wss:WebSocket.Server;
    private map:Map<FilterIdString,WebSocket.WebSocket[]>;
    private decoder:TextDecoder;
    private static instance:LiveStream;

    private constructor(){}

    public static getInstance(){
        if(LiveStream.instance)return LiveStream.instance
        LiveStream.instance = new LiveStream();
        return LiveStream.instance;
    }

    public init(server){
        if(this.wss)return;
        this.decoder=new TextDecoder("utf-8");
        this.map=new Map<FilterIdString,WebSocket.WebSocket[]>();
        this.wss = new WebSocket.Server({server:server});
        this.wss.on('connection',(ws)=>{
            console.log("Connected - WebSocket");
            ws.send("Server said HELLO");
            ws.on('message',(message)=>{
                let filterId = this.decoder.decode(message as ArrayBuffer);
                try{
                    if(!Types.ObjectId.isValid(filterId))throw "Not a valid ID"; 
                    if(!this.map.has(filterId))this.map.set(filterId,[]);
                    this.addSocketToMap(filterId,ws);
                }
                catch(e){
                    ws.send("error with provided filterId --- "+e);
                }
                console.log(filterId);
            })
            
        })
        
    }

    private addSocketToMap(filterId:FilterIdString,ws:WebSocket.WebSocket){
        let list: WebSocket.WebSocket[] = this.map.get(filterId);
        let found = false;
        for(let l of list){
            if(l==ws){
                found=true;
                break;
            }
        }
        if(!found)list.push(ws);

    }

    public broadcastData(filterId:Types.ObjectId,data:any){
        if(!this.map.has(filterId.toString()))return;
        let socketList = this.map.get(filterId.toString());
        for(let i=0;i<socketList.length;i++){
            if(socketList[i].readyState == WebSocket.OPEN){
                socketList[i].send(JSON.stringify(data));
                socketList[i].send("Sending item!")
            }
            else{ //socket not opened
                socketList.splice(i,1); //remove socket
                i--; //revisit same index - has new elemnt
            }
        }

    }
}

export default LiveStream;
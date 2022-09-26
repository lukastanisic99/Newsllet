import Axios from "axios"
import { Types } from "mongoose";
import MatchDB from "./models/match";
import ConcurrentRegex from "./concurrentRegex";
import LiveStream from "./liveStream";
const axios = Axios.create({timeout:10000});
export class Regex{
    regex:RegExp;
    pattern:string;
    
    constructor(pattern:string){
        this.pattern=pattern;
        this.regex=new RegExp(pattern);
    }
}

class Filter {
    private regexs:Regex[]=[];
    private filterId:Types.ObjectId;
    private cRegex:ConcurrentRegex=new ConcurrentRegex();
    private persistCount:number=0; //used for statistics
    private newCount:number=0;
    private editCount:number=0;
    private persistCount2:number=0; //used for statistics
    private newCount2:number=0;
    private axiotCount:number=0;
    private axiotCount2:number=0;

    constructor(filterId:Types.ObjectId){
        this.filterId=filterId;
    }

    public addPattern(pattern:string){
        console.log("PATTERN ADDED :::::::::::::");
        let r = new Regex(pattern);
        this.regexs.push(r);
        this.cRegex.addPattern(pattern);
    }
    
    public addPatterns(patterns:string[]){
        for(let p of patterns)this.addPattern(p);
        this.cRegex.addPatterns(patterns);
    }

    public getId(){return this.filterId;}
    //Type any - jer rssItem nije uvek istog formata
    /*
    Asumtion - each rssItem at least has the following fields:
    title : string
    description : string 
    link : string
    */
    public async filterData(rssItem:any){
        try{
            //try and match title and short description -> 100% 
            for(let r of this.regexs){
                if(r.regex.test(rssItem["title"])){
                    // console.log("Match title",rssItem);
                    await this.acceptItem(rssItem,100);
                    return;
                }
                if(r.regex.test(rssItem["description"])){
                    // console.log("Match description",rssItem);
                    await this.acceptItem(rssItem,100);
                    return;
                }
            }
            //fetch content -> try match -> probability
            console.log("Axios start *****",++this.axiotCount)
            if(!rssItem["pageContent"])rssItem["pageContent"]=(await axios.get(rssItem["link"])).data; //TODO - optimize lazy fetching for multi filters
            else {
                console.log("It works as expected");
            }
            console.log("Axios end *****",++this.axiotCount2)
            if(await this.cRegex.test(rssItem["pageContent"]))
                await this.acceptItem(rssItem,50);
        }
        catch(e){
            console.log("Filter error ************** ",e); 
        }
    }
    private async acceptItem(rssItem,trustScore:number){
        let rssItemClone = Object.assign({},rssItem); //This is actually one of the most inefficient parts of the code - it's more efficient to mark "pageContent" and skip persisting it, but keep passing the same object refrence around the code, than to make a copy and remove the property.
        delete rssItemClone["pageContent"];
        console.log(rssItemClone);
        LiveStream.getInstance().broadcastData(this.filterId,rssItemClone);
        await this.persistItem(rssItemClone,trustScore);
    }
    private async persistItem(rssItem,trustScore:number){
        try{
            console.log("Persist item start *****",++this.persistCount)
            let m = await MatchDB.findOne({item:rssItem}).exec();
            console.log("Persist item end *****",++this.persistCount2)

            if(!m){
                m = new MatchDB({
                    item:rssItem,
                    filters:[{filterid:this.filterId,trustScore:trustScore}]
                });
                console.log("NEW item start *****",++this.newCount)
                await m.save();
                console.log("NEW item end *****",++this.newCount2)
            }
            else{
                console.log("EDIT item *****",++this.editCount)
                await MatchDB.updateOne({item:rssItem},{$push:{filters:{filterid:this.filterId,trustScore:trustScore}}});
            }
        }catch(e){
            console.log("Persist error ********",e);
        }
    }
}

export default Filter;
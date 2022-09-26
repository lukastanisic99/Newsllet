import Axios from "axios";
import { XMLParser } from "fast-xml-parser";
import Filter from "./filter";
import MatchDB from "./models/match";
const axios = Axios.create({timeout:5000});

class Observer {
    private domainUrl:string;
    private interval: number; //in milliseconds
    private intervalHandle;
    private parser:XMLParser;
    private lastContentDate:Date // the date of the last published article
    private filters:Filter[]=[];

    constructor(url:string,interval:number){
        this.domainUrl=url;
        this.interval=interval;
        this.parser = new XMLParser();
    }

    public async start():Promise<void>{
        this.lastContentDate=await this.getLastPostDate();
        await this.collectData();
        this.intervalHandle=setInterval(async()=>{
            await this.collectData()
        },this.interval)
        
    }

    public async getContent(url:string):Promise<object>{
        let response = await axios.get(this.domainUrl);
        return this.parser.parse(response.data);
        
    }

    public stop():void{
        clearInterval(this.intervalHandle);
    }

    public setDomainUrl(url:string){
        this.domainUrl=url;
    }

    public getDomainUrl():string{
        return this.domainUrl;
    }

    public setInterval(interval:number){
        this.interval=interval;
    }

    public getInterval():number{
        return this.interval;
    }

    public addFilter(filter:Filter){
        this.filters.push(filter);
    }
    
    public addFilters(filters:Filter[]){
        for(let f of filters)this.addFilter(f);
    }
    // item of RSS items - not a fix structure - can be flexible but has to have minimum some fields (check Filter.ts)
    private async filtersPushData(item:any){
        for(let filter of this.filters){
           await filter.filterData(item);
        }
    }
    private async collectData(){
        try{
            let obj = await this.getContent(this.domainUrl);
            let items = obj["rss"].channel.item;
            let maxDate:Date; //used to assign max date to lastContentDate post iteration
            for(let item of items){
                let itemDate = new Date(item.pubDate);
                if(!maxDate)maxDate=itemDate;
                if(!this.lastContentDate || itemDate>this.lastContentDate){
                    item.domain=this.domainUrl; //extend object
                    await this.filtersPushData(item); // TODO - comment on this await 
                }
                else break;
            }
            if(maxDate)this.lastContentDate=maxDate;
            
        }
        catch(e){
            console.log("Observer error *************",e);
        }
    }

    private async getLastPostDate():Promise<Date>{
        let date = await MatchDB.aggregate([
            {$match:{"item.domain":this.domainUrl}},
            {$project:{"date":{$dateFromString:{dateString:"$item.pubDate"}}}},
            {$sort:{"date":-1}},
            {$limit:1}
        ])
        if(date.length>0)return new Date(date[0].date)
        return null;
    }
}

export default Observer;
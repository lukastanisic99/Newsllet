import axios from "axios";
import { XMLParser } from "fast-xml-parser";

class Observer {
    private domainUrl:string;
    private interval: number; //in milliseconds
    private intervalHandle;
    private parser:XMLParser;
    private lastPublishDate:Date; //when RSS was last updated
    private lastContentDate:Date // the date of the last published article
    
    constructor(url:string,interval:number){
        this.domainUrl=url;
        this.interval=interval;
        this.parser = new XMLParser();
    }

    public start():void{
        this.intervalHandle=setInterval(async ()=>{
            try{
                let obj = await this.getContent(this.domainUrl);
                let date: Date = new Date(obj["rss"].channel.lastBuildDate);
                if(!this.lastPublishDate || date>this.lastPublishDate){
                    this.lastPublishDate=date; 
                    console.log(obj);
                }
            }
            catch(e){
                console.log(e);
            }
        },this.interval)
    }

    public async getContent(url:string):Promise<object>{
        // let response:Response;
        // response=await fetch(this.domainUrl);
        // return this.parser.parse(await response.text());
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
}

export default Observer;
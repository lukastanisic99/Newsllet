import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import Filter from "./filter";

class Observer {
    private domainUrl:string;
    private interval: number; //in milliseconds
    private intervalHandle;
    private parser:XMLParser;
    private lastPublishDate:Date; //when RSS was last updated
    private lastContentDate:Date // the date of the last published article
    private filters:Filter[]=[];

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
                    let items = obj["rss"].channel.item;
                    let maxDate:Date; //used to assign max date to lastContentDate post iteration
                    for(let item of items){
                        let itemDate = new Date(item.pubDate);
                        if(!maxDate)maxDate=itemDate;
                        if(!this.lastContentDate || itemDate>this.lastContentDate){
                            this.filtersPushData(item);
                        }
                        else break;
                    }
                    if(maxDate)this.lastContentDate=maxDate;
                    console.log(obj);
                }
            }
            catch(e){
                console.log(e);
            }
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
    private filtersPushData(item:any){
        for(let filter of this.filters){
            filter.filterData(item);
        }
    }
}

export default Observer;
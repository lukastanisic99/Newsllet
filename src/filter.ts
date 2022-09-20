import axios from "axios"
class Regex{
    regex:RegExp;
    pattern:string;

    constructor(pattern:string){
        this.pattern=pattern;
        this.regex=new RegExp(pattern);
    }
}

class Filter {
    private regexs:Regex[]=[];

    public addPattern(pattern:string){
        let r = new Regex(pattern);
        this.regexs.push(r);
    }
    
    public addPatterns(patterns:string[]){
        for(let p of patterns)this.addPattern(p);
    }

    //Type any - jer rssItem nije uvek istog formata
    /*
    Asumtion - each rssItem at least has the following fields:
    title : string
    description : string 
    link : string
    */
    public async filterData(rssItem:any){
        try{
            let match:boolean = false;
            //try and match title and short description -> 100% 
            for(let r of this.regexs){
                if(r.regex.test(rssItem["title"])){
                    match=true;
                    console.log("Match title",rssItem);
                    break;
                }
                if(r.regex.test(rssItem["description"])){
                    match=true;
                    console.log("Match description",rssItem);
                    break;
                }
            }
            if(match){
                //persist 100% 
                return;
            }
            //fetch content -> try match -> probability
            let html:string = (await axios.get(rssItem["link"])).data;
            for(let r of this.regexs){
                if(r.regex.test(html)){
                    console.log("Match html",rssItem);
                    match=true;
                    break;
                }
            }
            if(match){
                //persist some probability;
            }
            

        }
        catch(e){
            console.log(e); 
        }
    }
}

export default Filter;
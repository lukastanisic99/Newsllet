import Observer from "./observer";
import Filter from "./filter";
import DomainDB from "./models/domain";
import FilterDB from "./models/filter";
import PatternDB from "./models/pattern";
import { Types } from "mongoose";
class Controller {
    private observers:Observer[]=[];
    private filters:Filter[]=[];

    private static instance:Controller;

    private constructor(){}

    public static getInstance(){
        if(Controller.instance)return Controller.instance
        Controller.instance = new Controller();
        return Controller.instance;
    }

    public async init(){
        //Filters 
        const filters = await FilterDB.aggregate([
            {
                $lookup: {
                    from: "Patterns",
                    localField: "patterns.patternid",
                    foreignField: "_id",
                    as: "patterns"
                }
            },
            {
                $project:{
                    "patterns._id":0
                }
            }
        ])
        for(let f of filters){
            console.log("FOR CONTROLLER FILTERS");
            let filter = new Filter(f._id);
            filter.addPatterns(f.patterns.map(p=>p.pattern));
            this.filters.push(filter);
        }
        //Domains -> Observers
        const domains = await DomainDB.find({});
        for(let domain of domains){
            console.log("FOR CONTROLLER OBSERVERS");
            let o = new Observer(domain.url,60000);
            o.addFilters(this.filters);
            o.start();
            this.observers.push(o);
        }
    }

    public addPaternToFilter(pattern:string,filterId:Types.ObjectId){
        for(let f of this.filters){
            if(f.getId()==filterId){
                f.addPattern(pattern);
            }
        }
    }

    public async addFilter(filterId:Types.ObjectId,patternIds:Types.ObjectId[]){
        let filter = new Filter(filterId);
        let patterns = await PatternDB.find({_id:{$in:patternIds}});
        for(let p of patterns)filter.addPattern(p.pattern);
        for(let o of this.observers)o.addFilter(filter);
    }

    public stopAll(){
        for(let o of this.observers){
            console.log("FOR CONTROLLER STOP");
            o.stop();
        }
    }
}

export default Controller;
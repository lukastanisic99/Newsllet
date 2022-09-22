import Observer from "./observer";
import Filter from "./filter";
import DomainDB from "./models/domain";
import FilterDB from "./models/filter";
class Controller {
    private observers:Observer[]=[];
    private filters:Filter[]=[];

    public async init(){
        //Filters 
        const filters = await FilterDB.aggregate([
            {
                $lookup: {
                    from: "Patterns",
                    localField: "patterns.filterid",
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
            // return; ////////////////////////////////// testing //////////////////////////////////
        }
    }

    public stopAll(){
        for(let o of this.observers){
            console.log("FOR CONTROLLER STOP");
            o.stop();
        }
    }
}

export default Controller;
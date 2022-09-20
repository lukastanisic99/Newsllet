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
            let filter = new Filter();
            filter.addPatterns(f.patterns.map(p=>p.pattern));
            this.filters.push(filter);
        }
        //Domains -> Observers
        const domains = await DomainDB.find({});
        for(let domain of domains){
            let o = new Observer(domain.url,1000);
            o.addFilters(this.filters);
            o.start();
            this.observers.push(o);
        }
    }

    public stopAll(){
        for(let o of this.observers){
            o.stop();
        }
    }
}

export default Controller;
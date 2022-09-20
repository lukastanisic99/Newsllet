import Observer from "./observer";
import Domain from "./models/domain";

class Controller {
    private observers:Observer[]=[];

    public async init(){
        const domains = await Domain.find({});
        for(let domain of domains){
            let o = new Observer(domain.url,1000);
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
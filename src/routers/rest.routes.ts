import express from 'express';
import { Types } from 'mongoose';
import Controller from '../controller';
import PatternDB from '../models/pattern';
import FilterDB from '../models/filter';
import MatchDB from '../models/match';

const restRouter = express.Router();

restRouter.route('/hello').get((req,res)=>{
    let c = Controller.getInstance();    
    res.send("Hello");
})

restRouter.route('/addPattern').post((req,res)=>{
    let pattern = req.body.pattern;
    let p = new PatternDB({pattern:pattern});
    p.save()
    .then(()=>{res.json({message:"OK"})})
    .catch((e)=>{res.json({error:e})})
})

restRouter.route('/getPatterns').get(async (req,res)=>{
     let patterns = await PatternDB.find({});
     res.json(patterns);
})

restRouter.route('/addPatternToFilter').post(async (req,res)=>{
    try{
        let filterId:Types.ObjectId = new Types.ObjectId(req.body.filterId);
        let patternId:Types.ObjectId = new Types.ObjectId(req.body.patternId); 
        let filter = await FilterDB.findOne({_id:filterId});
        if(!filter)return res.json({message:"No filter with given ID"});
        let pattern = await PatternDB.findOne({_id:patternId});
        if(!pattern)return res.json({message:"No pattern with given ID"});

        await FilterDB.updateOne({_id:filterId},{$push:{patterns:{patternid:patternId}}});
        let c = Controller.getInstance();
        c.addPaternToFilter(pattern.pattern,filterId);    
        res.json({message:"OK"});
    }catch(e){
        res.json({message:"Invalid cobination of filterId and patternId"});
    }
})

restRouter.route('/getFilterPatterns').get(async (req,res)=>{
    try{
        let filterId:Types.ObjectId = new Types.ObjectId(req.query.filterId as string);
        let result = await FilterDB.aggregate([
            {$match:{_id:filterId}},
            {
                $lookup: {
                    from: "Patterns",
                    localField: "patterns.patternid",
                    foreignField: "_id",
                    as: "patterns"
                }
            },
        ])
        res.json(result[0].patterns);
    }catch(e){
        res.json({message:"Not a valid filterId"});
    }
})

restRouter.route('/getFilters').get(async (req,res)=>{
    let result = await FilterDB.find({});
    res.json(result);
   
})

restRouter.route('/addFilter').post(async (req,res)=>{
    try{
        let patternIds:string[] = req.body.patternIds;
        let patterns = [];
        for(let pid of patternIds){
            let obj = {patternid:new Types.ObjectId(pid)};
            patterns.push(obj);
        }
        let filter = new FilterDB({_id:new Types.ObjectId(),patterns:patterns});
        let f = await filter.save();
        let c = Controller.getInstance();
        await c.addFilter(f._id as Types.ObjectId,patternIds.map((id)=>new Types.ObjectId(id)));
        /// CONTROLER ADD FILTER
        res.json({message:"OK"});
    }catch(e){
        res.json({message:"Not a valid patternId"});

    } 
})

restRouter.route('/getFilterMatches').get(async (req,res)=>{
    try{
        let filterId:Types.ObjectId = new Types.ObjectId(req.query.filterId as string);
        let result = await MatchDB.find({
            "filters.filterid":{$in:[filterId]}
        })
        res.json(result);
    }catch(e){
        res.json({message:"Not a valid filterId"});
    }
})
export default restRouter;
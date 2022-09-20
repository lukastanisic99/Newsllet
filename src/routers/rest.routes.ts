import express from 'express';
const restRouter = express.Router();


restRouter.route('/hello').get((req,res)=>{
    res.send("Hello");
})

export default restRouter;
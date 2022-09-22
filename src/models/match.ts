import mongoose from 'mongoose'
import { Types } from 'mongoose';

const Schema = mongoose.Schema;

let FilterMatch = new Schema({
    filterid:Types.ObjectId,
    trustScore:Number
},{_id:false});

let Match = new Schema({
    item: {
        type: Object
    },
    filters:[FilterMatch]
})
 
export default mongoose.model('Match', Match, 'Matches');
import mongoose, { Types } from 'mongoose'

const Schema = mongoose.Schema;

let Filter = new Schema({
    _id:Types.ObjectId,
    patterns: [{
        filterid:Types.ObjectId
    }]
})
 
export default mongoose.model('Filter', Filter, 'Filters');
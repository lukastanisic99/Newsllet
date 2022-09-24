import mongoose, { Types } from 'mongoose'

const Schema = mongoose.Schema;

let Pattern = new Schema({
    patternid:Types.ObjectId,
},{_id:false});

let Filter = new Schema({
    _id:Types.ObjectId,
    patterns: [Pattern]
})
 
export default mongoose.model('Filter', Filter, 'Filters');
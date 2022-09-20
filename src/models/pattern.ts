import mongoose from 'mongoose'

const Schema = mongoose.Schema;

let Pattern = new Schema({
    pattern:String
})
 
export default mongoose.model('Pattern', Pattern, 'Patterns');
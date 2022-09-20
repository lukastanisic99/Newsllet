import mongoose from 'mongoose'

const Schema = mongoose.Schema;

let Filter = new Schema({
    patterns: {
        type: Array
    }
})
 
export default mongoose.model('Filter', Filter, 'Filters');
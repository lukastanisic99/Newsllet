import mongoose from 'mongoose'

const Schema = mongoose.Schema;

let Match = new Schema({
    item: {
        type: Object
    },
    filters:{
        type:Array
    }
})
 
export default mongoose.model('Match', Match, 'Matches');
import mongoose from 'mongoose'

const Schema = mongoose.Schema;

let Domain = new Schema({
    name: String,
    url: String
})
 
export default mongoose.model('Domain', Domain, 'Domains');
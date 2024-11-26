const mongoose = require('mongoose');

mongoose.connect(process.env.DB).then(()=>console.log('Connected successfully'));
const BookModel = mongoose.model('Book',new mongoose.Schema({
    title:{type:String,required:true},
    comments:[String]
}))
module.exports={
    BookModel,
}
const { link } = require('fs/promises');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notesschema = new Schema({
    title:{
        type:String,
        required:true,
    },
    description1:{
        type:String,
        required:true,
    },
    description2:{
        type:String,
        required:true,
    },
    name:{
        type:String,
        required:true,
    },
    contributer_id:{
        type:String,
        required:true,
    },
    document_id:
    {
      type:String,
      required:true,
    },
    document_url:
    {
        type:String,
        //required:true,
    }
});
const notes = mongoose.model('notes',notesschema);
module.exports = notes;
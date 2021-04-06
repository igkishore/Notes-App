const { link } = require('fs/promises');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const notesschema = new Schema({
    title:{
        type:String,
        required:true,
    },
    type:{
        type:String,
        required:true,
    },
    domain:{
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
        required:true,
    }

},{ timestamps: true });
const notes = mongoose.model('notes',notesschema);
module.exports = notes;
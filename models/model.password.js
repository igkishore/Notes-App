const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passwordschema = new Schema({
  name:{
    type: String,
    required:true,
    unique:true,
  },
  email:
  {
    type:String,
    required:true,
  },
  password:
  {
    type:String,
    required:true,
  }
});
const password = mongoose.model('password',passwordschema);
module.exports = password;
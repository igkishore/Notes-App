const notes_db = require('../models/model.notes');
const passport = require('../passport');
const fs = require('fs');
const { ALL } = require('dns');

const dashboard_get = (req,res) =>{
    var user_id  = req.session.passport.user;
    notes_db.find().sort({createdAt:-1})
    .then(result =>{
        //console.log(result.document.data)
      res.render('dashboard',{notes :result ,user_id : user_id});
    })
    .catch(err => {
      console.log(err);
    })
}

const addnotes_get = (req,res)=>{
    res.render('addnotes');
}

const explore_get = (req,res) =>{
    notes_db.find().sort({createdAt:-1})
    .then(result =>{
      res.render('explore',{notes :result,category1:"ALL",category2:"ALL"});
    })
    .catch(err => {
      console.log(err);
    })
}

const explore_post_get = (req,res) =>{
  notes_db.find().sort({createdAt:-1})
  .then(result =>{
    res.render('explore',{notes :result,category1:req.body.type,category2:req.body.domain});
  })
  .catch(err => {
    console.log(err);
  })
}

const newnotes_get = (req,res) =>{
    res.render('newnotes');
}




module.exports = {
    dashboard_get,
    addnotes_get,
    explore_get,
    newnotes_get,
    explore_post_get
}
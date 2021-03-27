const notes_db = require('../models/model.notes');
const passport = require('../passport');
const fs = require('fs')

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
        //console.log(result.document.data)
      res.render('explore',{notes :result});
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
    newnotes_get
}
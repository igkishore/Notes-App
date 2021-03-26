const notes_db = require('../models/model.notes');
const passport = require('../passport');

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

const delete_notes = (req,res) =>{
  const user_id = req.session.passport.user;
  const notes_id = req.params.id;
  notes_db.findById(notes_id)
  .then(result =>{
    if(result.contributer_id==user_id){
      notes_db.findByIdAndDelete(notes_id)
      .then(result => {
    
        res.json({ redirect: '/' });
      })
      .catch(err => {
        console.log(err);
      });
    }
  })
  .catch(err => {
    console.log(err);
  });
 
}


module.exports = {
    dashboard_get,
    addnotes_get,
    explore_get,
    newnotes_get,
    delete_notes
}
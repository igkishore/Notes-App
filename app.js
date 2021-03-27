const express = require('express');
const mongoose = require('mongoose');
const bodyParser=require('body-parser');
const bcrypt = require('bcrypt');
const flash  =require('connect-flash');
const session = require('express-session');
const passport = require('passport'); 
const { ensureAuthenticated } = require('./auth');
require('./passport')(passport);
const memberRoutes = require("./routes/memberroutes")
const fs = require('fs');

//Express App
const app = express();
var port = (process.env.PORT || 3000);

//Data Base
const password_db = require('./models/model.password');
const notes_db = require('./models/model.notes');
const dburl = "mongodb+srv://gowtham:test1234@main.l0g6f.mongodb.net/notesapp_db?retryWrites=true&w=majority";
mongoose.connect(dburl,{useNewUrlParser:true,useUnifiedTopology:true,useCreateIndex:true })
.then(result=> app.listen(port))
.catch(err=>console.log(err));

//View Engine
app.set('view engine','ejs');



//Multer
var path = require('path');
var multer = require('multer');
var pdf_file_name;
var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
    pdf_file_name=Date.now();
		cb(null, file.fieldname + '-' + Date.now() + '.pdf')

	}
});
var upload = multer({ storage: storage });

//Static , Password , MiddleWare
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(express.json());
app.use(session({
  secret: 'gowtham',
  resave: true,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Authentication

app.get('/login',(req,res)=>{
  res.render('login');
})

app.post('/login',(req,res,next) => {
    passport.authenticate('local',{

      successRedirect:'dashboard',
      failureRedirect:'login',
      failureFlash:true
    }) (req,res,next);
})

app.get('/register',(req,res)=>{
    res.render('register');
})

app.post('/register',(req,res)=>{
        if(req.body.password1!=req.body.password2)
        {
            res.redirect('register');
        }
        else{
      const newuser = new password_db( {name:req.body.name , password:req.body.password1});
      bcrypt.genSalt(10,(err,salt) =>
        bcrypt.hash(newuser.password,salt,(err,hash) =>
        {
          if(err) throw err;
          newuser.password =hash;
          newuser.save()
          .then(user =>
            {
              res.redirect('/login')
            })
          .catch(err => console.log(err));
        })
      )
    }
  })

  app.get('/logout',(req,res) =>{
    req.logout();
    res.redirect('/');
  })

// Ading Notes

app.post("/newnotes",ensureAuthenticated, upload.single('doc'), (req, res) => {
    var obj = {
        title: req.body.title,
        description1: req.body.description1,
        description2: req.body.description2,
        name: req.body.name,
        contributer_id:req.session.passport.user,
        document: 'doc' + '-' + pdf_file_name + '.pdf' 
    }
    notes_db.create(obj, (err, item) => {
      if (err) {
        console.log(err);
      }
      else {
        res.redirect('/');
      }
    });
  })
/*
  app.get('/update/:id',(req,res) =>{
    const notes_id = req.params.id;
    notes_db.findById(notes_id)
    .then(result =>{
      res.render('editnotes',{notes : result});
     })
     .catch(err => {
       console.log(err);
     })
  })

  app.put('/update/:id',(req,res) =>{
    const user_id = req.session.passport.user;
    notes_db.findById(notes_id)
    .then(result =>{
      if(result.contributer_id == user_id)
      {
        const id = req.params.id;
        notes_db.updateOne(id,req.body)
        .then(suc =>{
          res.redirect('/')
        })
        .catch(err =>{
          console.log(err);
        })
      }
      else{
        res.redirect('/');
      }
     })
     .catch(err => {
       console.log(err);
     })
  })
   
*/
// Getting Pdfs 

app.get('/uploads/:docname',ensureAuthenticated,(req,res) =>{
  var file_name = req.params.docname
  var render_file = "/uploads/" + (file_name);


    fs.readFile(__dirname + render_file , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
})
/*
app.delete('/delete/:id',(req,res)=>{
  const user_id = req.session.passport.user;
  const notes_id = req.params.id;
  notes_db.findByIdAndDelete(notes_id)
  .then(result => {
    res.json({ redirect: '/' });
  })
  .catch(err => {
    console.log(err);
  });
})*/


app.delete('/:id',ensureAuthenticated,(req,res)=>{

  const user_id = req.session.passport.user;
  const notes_id = req.params.id;

  notes_db.findById(notes_id)
  .then(result =>{
    if(result.contributer_id==user_id){
     const path = __dirname + "/uploads/" + result.document;
     try{
       fs.unlinkSync(path);
     }
     catch(err){
       console.log(err);
     }
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
});

// Member Notes
app.use('/',memberRoutes);


//404

app.use((req,res) =>{
  res.status(404).render('404');
})


const express = require('express');
const mongoose = require('mongoose');
const bodyParser=require('body-parser');
const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport'); 
const { ensureAuthenticated } = require('./auth');
require('./passport')(passport);
const memberRoutes = require("./routes/memberroutes")
const fs = require('fs');
const {google} = require('googleapis');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();
const flash = require('connect-flash');
//const mailgun = require('mailgun-js');
//console.log(process.env);

// Google drive apis 
const CLIENT_ID = process.env.CLIENT_ID_URL;
const CLIENT_SECRET = process.env.CLIENT_SECRET_URL;
const REDIRECT_URI =process.env.REDIRECT_URI_URL;
const REFRESH_URI = process.env.REFRESH_URI_URL;
const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);
 oauth2Client.setCredentials({refresh_token:REFRESH_URI});

 const drive = google.drive({
   version:'v3',
   auth:oauth2Client
 });

//Express App
const app = express();
var port = (process.env.PORT || 3000);

//Data Base
const password_db = require('./models/model.password');
const notes_db = require('./models/model.notes');
const dburl = process.env.DB_URL;
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
    pdf_file_name = uuidv4() + '.pdf' ;
		cb(null, pdf_file_name)

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

//Mail 
/*
var API_KEY = '61118d30e9bdc7c96107a6fa42a4a11c-b6d086a8-e70422b3';
var DOMAIN = 'sandbox89d7d6f1089b428d8e4a94b168f9c518.mailgun.org';
const mailgun = require('mailgun-js')({apiKey: API_KEY, domain: DOMAIN});
  
sendMail = function(sender_email, reciever_email,
         email_subject, email_body){
  
  const data = {
    "from": sender_email,
    "to": reciever_email,
    "subject": email_subject,
    "text": email_body
  };
    
  mailgun.messages().send(data, (error, body) => {
    if(error) console.log(error)
    else console.log(body);
  });
}
  
var sender_email = 'gow <gowthamkishoreindukuri@gmail.com>'
var receiver_email = 'gowthamkishoreindukuri@gmail.com'
var email_subject = 'Mailgun Demo'
var email_body = 'Greetings from geeksforgeeks'
  
// User-defined function to send email
sendMail(sender_email, receiver_email, 
            email_subject, email_body)

*/



// Authentication
app.get('/login',(req,res)=>{
  const error = req.flash().error  || [];
  res.render('login',{error})
})

app.post('/login',(req,res,next) => {

    passport.authenticate('local',{

      successRedirect:'dashboard',
      failureRedirect:'login',
      failureFlash: 'Invalid Username or password'
    }) (req,res,next);
})

app.get('/register',(req,res)=>{
    res.render('register',{error:''});
})

app.post('/register',(req,res)=>{
        if(req.body.password1!=req.body.password2)
        {
            res.render('register',{error : 'Password did not match'});
        }
        else{
      const newuser = new password_db( {name:req.body.name ,email:req.body.mail, password:req.body.password1});
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
          .catch(err => {
            res.render('register',{error : 'Username Already Exists'});
            //console.log(err);
          });
        })
      )
    }
  })

  app.get('/logout',(req,res) =>{
    req.logout();
    res.redirect('/');
  })

// Ading Notes

app.post("/newnotes",ensureAuthenticated, upload.single('doc'),(req, res) => {
  var id = '',link='';
  const file_path = "uploads/" + pdf_file_name;
  async function uploadfile(){
    try
    {
      const response = await drive.files.create({
        requestBody:{
          name: pdf_file_name,
          mimeType: 'application/pdf',
        },
        media:
        {
          mimeType:'application/pdf',
          body: fs.createReadStream(file_path),
        },
      })
      id = response.data.id;
      //console.log(id);
    }
    catch(err)
    {
      console.log(err);
    }
  }
  uploadfile()
  .then(result => {
    /* try{
       fs.unlinkSync(file_path);
     }
     catch(err){
       console.log(err) ;
     }*/
    async function generateurl()
    {
      try{
        const file_id  = id;
        await drive.permissions.create({
          fileId:file_id,
          requestBody:{
            role:'reader',
            type:'anyone',
          },
      });

        const result = await drive.files.get({
        fileId:file_id,
        fields:'webViewLink,webContentLink',
      });
      link=result.data.webViewLink;
      //console.log(result.data);
    }
    catch(err)
    {
      console.log(err);
    }
  }
  generateurl()
  .then(result=>{
    var obj = {
      title: req.body.title,
      description1: req.body.description1,
      description2: req.body.description2,
      name: req.body.name,
      contributer_id:req.session.passport.user,
      document_id: id,
      document_url:link,
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
  })
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
/*
app.get('/uploads/:docname',(req,res) =>{
  var file_name = req.params.docname
  var render_file = "/uploads/" + (file_name);


    fs.readFile(__dirname + render_file , function (err,data){
        res.contentType("application/pdf");
        res.send(data);
    });
})*/


app.delete('/:id',ensureAuthenticated,(req,res)=>{
  const user_id = req.session.passport.user;
  const notes_id = req.params.id;

  notes_db.findById(notes_id)
  .then(result =>{
    if(result.contributer_id==user_id){
     /**/
        async function deletefile()
          {
            try{
              const responce = await drive.files.delete({
              fileId : result.document_id
            });
          }
          catch(err)
          {
            console.log(err);
          }
          }
        deletefile();
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


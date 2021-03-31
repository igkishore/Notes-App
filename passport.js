const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const user = require('./models/model.password');

module.exports = function(passport)
{
    passport.use(
        new LocalStrategy({usernameField : 'name'},(name,password,done) =>{
            user.findOne({name:name})
            .then(user =>{
                if(!user)
                {
                    return done(null,false,{message:'User not present'});
                }
            bcrypt.compare(password,user.password,(err,isMatch) =>{
                if(err)throw err;

                if(isMatch)
                {
                    return done(null,user);
                }
                else{
                    return done(null,false,{message :'password incorrect'});
                }
            });
            })
            .catch(err => console.log(err)); 
        })
    );
    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
      passport.deserializeUser((id, done) => {
        user.findById(id, (err, user) => {
          done(err, user);
        });
      });
}
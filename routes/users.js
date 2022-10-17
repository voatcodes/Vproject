var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var bcrypt = require('bcrypt');
var session = require('express-session');
var connection = require('../dbconfig')




//create session middleware 
router.use(session({
  secret: 'siri',
  resave: false,
  saveUninitialized: false
}))


//continously check if user is logged in
router.use((req, res, next) => {
  if (req.session.userID === undefined) {
      res.locals.isLoggedIn = false
  } else {
      res.locals.isLoggedIn = true
      res.locals.username = req.session.username
      res.locals.user = req.session.user
      res.locals.business = req.session.profile
  }
  next()
})



/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

// display login form

router.get('/login', (req, res) => {
  const user ={
    email:'',
    password:'',
  }
  res.render('users/login', {error:false, user:user})
})


// submit login form


router.post('/login', (req, res) => {

  connection.query(
      'SELECT * FROM user_profile WHERE email = ?',
      [req.body.email],
      (error, results) => {
          if (results.length > 0) {
//               // authenticate 
              bcrypt.compare(req.body.password, results[0].password, (error, matches) => {
                  if (matches) {
                      req.session.userID = results[0].userID
                      req.session.username = results[0].fullname.split(' ')[0]
                      req.session.user = 'reviewer'
                      res.redirect('/app')
                  } else {
                      const user = {
                          email: req.body.email,
                          password: req.body.password
                      }
                      let message = 'Email/Password mismatch.'
                      res.render('reviewerprofile', { error: true, message: message, user: user })
                  }
              })
          } else {
              const user = {
                  email: req.body.email,
                  password: req.body.password
              }
              let message = 'Account does not exist. Please create one.'
              res.render('users/signup', { error: true, message: message, user: user })
          }
      }
  )
})


// //display signup form


router.get('/signup', (req, res) => {

  const user = {
    dob: '',
    fullname: '',
    preferedUsername: '',
    email: '',
    pNumber: '',
    password: '',
    confirmPassword: ''
  }


  res.render('users/signup', { error: false, user: user })
})





 //submit signup form

router.post('/signup', (req, res) => {


  if(req.body.password === req.body.confirmPassword) {

    connection.query(

      'SELECT email FROM user_profile WHERE email = ?',
      [req.body.email],
      (error,results) => {
        if(results.length > 0){

          const user = {
            dob: req.body.dob,
            fullname: req.body.fullname,
            preferedUsername: req.body.preferedUsername,
            email: req.body.email,
            pNumber: req.body.pNumber,
            password: req.body.password,
            confirmPassword: req.body.confirmPassword

        }

        let message = 'Account with this email already exists'
        res.render('users/login', {error: true, message:message, user: user})
           
      
        } else{
          bcrypt.hash(req.body.password, 10, (error, hash) => {
            connection.query(
              'INSERT INTO user_profile (dob, fullname, preferedusername, email, pnumber, pword) VALUES (?,?,?,?,?,?)',
              
              [req.body.dob, req.body.fullname, req.body.preferedUsername, req.body.email, req.body.pNumber, hash],
          
              (error, results) => {
                res.redirect('/users/login')
              }
            )
          })
        }
        }
        )
       } else {

        const user = {
                      dob: req.body.dob,
                      fullname: req.body.fullname,
                      preferedUsername: req.body.preferedUsername,
                      email: req.body.email,
                      pNumber: req.body.pNumber,
                      password: req.body.password,
                      confirmPassword: req.body.confirmPassword
          
                  }

      let message ='Password and confirm password does not match!'
      res.render('/users/signup', {error:true, message:message, user:user})

        }
      })




// display reviewer profile

router.get('/reviewerprofile/:id', (req, res) => {

  const profile = {

    name: '',
    email: '',
    phoneNumber: '',
    datejoined: '',
    facebookURL: '',
    twitterURL: '',
    instagramURL: '',
    photoURL: ''
  }
  res.render('/reviewerprofile', { error: false, profile: profile })
})



//display reviewers edit profile form

router.get('/editprofile/:id', (req, res) => {
  

      let sql = 'SELECT * FROM  user_profile WHERE userID =?'

      connection.query(
          sql, [parseInt(req.params.id)],
          (error, results) => {
            
              const profile = {
                  userID: results[0].userID,
                  dob: results[0].dob,
                  fullName:results[0].fullname,
                  userName: results[0].preferedusername,
                  email: results[0].email,
                  phoneNumber: results[0].pnumber,
                  facebookURL: results[0].facebookURL,
                  twitterURL: results[0].twitterURL,
                  instagramURL: results[0].instagramURL,
                  dateJoined: results[0].datejoined,
                  photoURL: results[0].photoURL,
                  cphotoURL: results[0].photoURL
              }
                console.log(profile)

              res.render('reviewereditprofile', { profile: profile })
              }

           )   
              
          })


//submit reviewer edit profile

router.post('/editprofile/:id', upload.single('photoURL'), (req, res) => {
  const profile = {
      dob: req.body.dob,
      fullname: req.body.fullname,
      username: req.body.username,
      email: req.body.email,
      phoneNumber: req.body.phoneNumber,
      facebookURL: req.body.facebookURL,
      twitterURL: req.body.twitterURL,
      instagramURL: req.body.instagramURL,
      dateJoined: req.body.datejoined,
      cphotoURL: undefined,
      photoURL: undefined
  }

  if (req.file) {

      profile.photoURL = req.file.filename
      
      let sql = 'UPDATE user_profile  SET dob=?, fullname = ?, preferedusername=?, email = ?, pnumber = ?,  facebookURL = ?, twitterURL = ?, instagramURL = ?, photoURL = ?, cphotoURL = ?, datejoined=? WHERE userID = ?'


      connection.query(
          sql,
          [             
                profile.dob, 
                profile.fullname,
                profile.username,
                profile.email,
                profile.phoneNumber,
                profile.facebookURL,
                profile.twitterURL,
                profile.instagramURL,
                profile.photoURL,
                profile.cphotoURL,
                profile.dateJoined
      
          ],
          (error, results) => {
              res.redirect('reviewerprofile')
              console.log(profile)
          }
      )

  } else {
      let sql = 'UPDATE user_profile  SET dob=?, fullname = ?, preferedusername=?, email = ?, pnumber = ?,  facebookURL = ?, twitterURL = ?, instagramURL = ?, photoURL = ?, cphotoURL = ?, datejoined=? WHERE userID = ?'

      connection.query(
          sql,
          [
           profile.dob, 
                profile.fullname,
                profile.username,
                profile.email,
                profile.phoneNumber,
                profile.facebookURL,
                profile.twitterURL,
                profile.instagramURL,
                profile.photoURL,
                profile.cphotoURL,
                profile.dateJoined       


          ],
          (error, results) => {
              res.redirect('reviewerprofile')
              console.log(profile)
          }
      )
    
  }

})
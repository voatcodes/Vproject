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
// router.use((req, res, next) => {
//   if (req.session.userID === undefined) {
//       res.locals.isLoggedIn = false
//   } else {
//       res.locals.isLoggedIn = true
//       res.locals.username = req.session.username
//       res.locals.user = req.session.user
//       res.locals.business = req.session.profile
//   }
//   next()
// })



/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});



// display signup form

router.get('/signup', (req, res) => {

    const businessprofile = {
        business: {
            businessName: '',
            businessEmail: '',
            businessCategory: '',
            businessDescription: '',
            businessLocation: '',
            businessTagline: ''
          },
    

    rep: {
      businessContactPerson: '',
      businessContactPersonPhoneNumber: '',
      businessContactPersonEmail: '',
      businessPassword: '',
      businessConfirmPassword: ''
    }

}

    res.render('businesses/signup', { error: false, businessprofile: businessprofile })
  })


  // submit signup form

  router.post('/signup', (req, res) => {

    const businessprofile = {
      businesses: {
      businessName: req.body.businessName,
      businessEmail: req.body.businessEmail,
      businessCategory: req.body.businessCategory,
      businessDescription: req.body.businessDescription,
      businessLocation: req.body.businessLocation,
      businessTagline: req.body.businessTagline
      },

      rep: {

      businessContactPerson: req.body.businessContactPerson,
      businessContactPersonPhoneNumber: req.body.businessContactPersonPhoneNumber,
      businessContactPersonEmail: req.body.businessContactPersonEmail,
      businessPassword: req.body.businessPassword,
      businessConfirmPassword: req.body.businessConfirmPassword

      }
      
  
    }

    if (businessprofile.rep.businessPassword === businessprofile.rep.businessConfirmPassword) {
    
      connection.query(

      'SELECT businessemail FROM v_project_business_profile WHERE businessemail = ?',
      [req.body.businessEmail], (error, results) => {
          if (results.length > 0) {
  
            let message = 'Account with this email already exists'
            res.render('businesses/login', { error: true, message: message, businessprofile: businessprofile })
  
  
          } else {
            bcrypt.hash(businessprofile.rep.businessPassword, 10, (error, hash) => {
              businessprofile.rep.businessPassword = hash
              connection.query(
                'INSERT INTO v_project_business_profile (businessname, businessemail, businesscategory, businessdescription, businesslocation, businesstagline, businesscontactperson, businesscontactpersonphonenumber, businessContactPersonEmail, businessPassword ) VALUES (?,?,?,?,?,?,?,?,?,?)',
  
                
                [ businessprofile.businesses.businessName, 
                  businessprofile.businesses.businessEmail, 
                  businessprofile.businesses.businessCategory, 
                  businessprofile.businesses.businessDescription, 
                  businessprofile.businesses.businessLocation,
                  businessprofile.businesses.businessTagline, 
                  businessprofile.businesses.businessContactPerson, 
                  businessprofile.businesses.businesscontactPersonPhoneNumber,
                  businessprofile.businesses.businessContactPersonEmail, 
                  hash
                ],
  
                (error, results) => {
                  // console.log(user)
                  console.log(businessprofile)
                  console.log(results)

                  res.redirect('/businesses/login')
                }
              )
            })
          }
        }
      )
    } else {
  
      
  
      let message = 'Password and confirm password does not match!'
      res.render('/businesses/signup', { error: true, message: message, businessprofile: businessprofile})
  
    }
  })



  //login routes

  // display login form

  router.get('/login', (req, res) => {
    const businessprofile = {
      businessemail: '',
      businesspassword: '',
    }
    res.render('businesses/login', { error: false, businessprofile: businessprofile })
  })


  // submit login form

  router.post('/login', (req, res) => {

    connection.query(
      'SELECT * FROM v_project_business_profile WHERE businessemail = ?',
      [businessprofile.businessEmail],
      (error, results) => {
        if (results.length > 0) {
          //               // authenticate 
          bcrypt.compare(req.body.businessPassword, results[0].businesspassword, (error, matches) => {
            if (matches) {
              // req.session.userID = results[0].userID
              // req.session.username = results[0].fullname.split(' ')[0]
              // req.session.user = 'reviewer'
              // res.redirect('/app')
            } else {
              const businessprofile = {
                email: req.body.businessEmail,
                password: req.body.businessPassword
              }
              let message = 'Email/Password mismatch.'
              res.render('businessprofile', { error: true, message: message, businessprofile: businessprofile })
            }
          })
        } else {

          const businessprofile = {
            email: req.body.businessEmail,
            password: req.body.businessPassword
          
          }
          let message = 'Account does not exist. Please create one.'
          res.render('businesses/signup', { error: true, message: message, businessprofile: businessprofile })
        }
      }
    )
  })


  
  
  module.exports = router;
  
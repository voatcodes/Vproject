const { application } = require('express');
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

module.exports = router;

//display signup form

router.get('/signup', (req,res) => {


  res.render('signup')
})



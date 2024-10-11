var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('exercise');
});

// router.get('/Arm_Dumbbel', function(req, res, next) {
//   res.render('Arm_Dumbbel');
// });

router.get('/Arm', function(req, res, next) {
  res.render('Arm');
});
router.get('/ABS', function(req, res, next) {
  res.render('ABS');
});
router.get('/Leg_Dumbbel', function(req, res, next) {
  res.render('Leg_Dumbbel');
});
router.get('/Leg', function(req, res, next) {
  res.render('Leg');
});
router.get('/Cardio', function(req, res, next) {
  res.render('Cardio');
});

module.exports = router;

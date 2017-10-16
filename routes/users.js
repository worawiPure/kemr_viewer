var express = require('express');
var router = express.Router();
var emrModel = require('../models/emr');
var crypto = require('crypto');

router.get('/login', function(req, res, next) {
  res.render('login', {error: null});
});
router.post('/login', function (req, res, next) {
  // console.log(req.body);
  var username = req.body.username;
  var password = req.body.password;
  var db = req.dbEmr;

  if (!username || !password) {
    var error = 'กรุณากรอกชื่อผู้ใช้งานและรหัสผ่าน';
    res.render('login', {error: error});
  } else {
    var encPassword = crypto.createHash('md5').update(password).digest('hex');
    console.log(encPassword);

    emrModel.login(db, username, encPassword)
      .then(function (rs) {
        console.log(rs);

        if (rs.length) {
          req.session.fullname = rs[0].fullname;
          res.redirect('/');
        } else {
          res.render('login', { error: 'ชื่อผู้ใช้งาน หรือ รหัสผ่านไม่ถูกต้อง' });
        }
      })
      .catch(function (error) {
        console.log(error.message);
        res.render('login', { error: 'Server error' });
      })
      .finally(function () {
        db.destroy();
      });
  }
});

module.exports = router;

var express = require('express');
var router = express.Router();
var emrModel = require('../models/emr');
var _ = require('lodash');
var moment = require('moment');
var path = require('path');
var fs = require('fs');

/* GET home page. */
router.get('/', function (req, res, next) {
  var hn = req.query.hn;
  if (hn) {
    req.session.hn = hn;
  } else {
    hn = req.session.hn;
  }
  res.render('index', { hn: hn, fullname: req.session.fullname });
});

router.get('/hello', function (req, res, next) {
  res.render('hello', { title: 'Express' });
});


router.post('/emr/search', function (req, res, next) {
  let hn = req.body.hn;
  let db = req.dbHOS;
  if (hn) {
    req.session.hn = hn;

    if (hn.length === 1) hn = `000000${hn}`;
    if (hn.length === 2) hn = `00000${hn}`;
    if (hn.length === 3) hn = `0000${hn}`;
    if (hn.length === 4) hn = `000${hn}`;
    if (hn.length === 5) hn = `00${hn}`;
    if (hn.length === 6) hn = `0${hn}`;

    console.log(hn);
    emrModel.search(db, hn)
      .then((results) => {
        console.log(results[0]);
        let uniqDate = _.uniqBy(results[0], "ym");
        let vstdate = [];
        let visits = [];

        uniqDate.forEach((v) => {
          let xx = _.filter(results[0], { ym: v.ym });
          let vdate = {
            id: v.ym,
            name: `${moment(v.ym, 'YYYY-MM').locale('th').format('MMMM')} ${moment(v.ym, 'YYYY-MM').get('year') + 543}`,
            visits: xx
          }
          vstdate.push(vdate);
        });
        res.send({ ok: true, rows: vstdate });
      })
      .catch(function (error) {
        console.log(error);
        res.send({
          ok: false,
          error: error.message
        })
      })
      .finally(() => {
        db.destroy();
      })
  } else {
    res.send({
      ok: false,
      error: {
        code: 500,
        message: "ไม่พบคำที่ค้นหา"
      }
    })
  }
});

router.get('/emr/detail/:vn', function (req, res, next) {
  let vn = req.params.vn;
  let db = req.dbHOS;

  if (vn) {
    var visit = null;

    emrModel.getVisitDetail(db, vn)
      .then(function (rows) {
        let results = rows[0][0];
        visit = {
          hn: results.hn,
          vn: results.vn,
          ptname: results.ptname,
          vsttime: moment(results.vsttime, 'HH:mm:ss').format('HH:mm'),
          vstdate: `${moment(results.vstdate).get('date')} ${moment(results.vstdate).locale('th').format('MMMM')} ${moment(results.vstdate).get('year') + 543}`,
          department: results.department,
          pttype: results.pttype_name,
          spclty: results.spclty_name,
          doctor: results.doctor_name,
          diag: results.diag
        }
        return emrModel.getImageList(req.dbEmr, vn);
      })
      .then(function (imgs) {
        // var images = [];
        var img1 = [];
        var img2 = [];
        var img3 = [];
        var img4 = [];
        var img5 = [];

        imgs.forEach(function (v) {
          var obj = {
            id: v.id,
            image_type: v.image_type,
            file_name: v.file_name,
            mime_type: v.mime_type,
            url: '/emr/view-image/' + v.id
            // url: 'http://via.placeholder.com/350x150'
          };

          console.log(v);

          if (v.image_type === '1') img1.push(obj);
          if (v.image_type === '2') img2.push(obj);
          if (v.image_type === '3') img3.push(obj);
          if (v.image_type === '4') img4.push(obj);
          if (v.image_type === '5') img5.push(obj);
        });
        console.log(img1);
        console.log(img2);
        console.log(img3);
        console.log(img4);
        console.log(img5);
        res.render('detail', { visit: visit, img1: img1, img2: img2, img3: img3, img4: img4, img5: img5 });
      })
      .catch(function (error) {
        console.log(error);
        res.send({
          ok: false,
          code: 500,
          message: error.message
        })
      })
      .finally(function () {
        db.destroy();
      });
  } else {
    res.send({ ok: false, error: 'ไม่พบรหัส VN' })
  }
});

router.get('/emr/view-image/:imageId', (req, res, next) => {
  let imageId = req.params.imageId;
  let db = req.dbEmr;
  if (imageId) {
    emrModel.getImageData(db, imageId)
      .then((results) => {
        let filePath = path.join(req.imagePath, results[0].file_path);
        let data = fs.readFileSync(filePath);
        res.writeHead(200, {
          'Content-Type': results[0].mimetype,
          'Content-Length': data.length
        });
        res.end(data);
      })
      .catch(err => {
        console.log(err);
        res.send({
          ok: false, error: {
            code: 500,
            message: err.message
          }
        })
      })
      .finally(() => {
        db.destroy();
      })
  } else {
    res.send({ ok: false, error: 'ไม่พบรหัสรูปภาพ' })
  }
})

router.get('/emr/image-list/:vn', function (req, res, next) {
  let vn = req.params.vn;
  let db = req.dbEmr;

  if (vn) {
    emrModel.getImageList(db, vn)
      .then(function (rows) {
        res.send({ ok: true, rows: rows });
      })
      .catch(function (err) {
        console.log(err);
        res.send({
          ok: false, error: {
            code: 500,
            message: err.message
          }
        })
      })
      .finally(function () {
        db.destroy();
      });
  } else {
    res.send({ ok: false, error: 'ไม่พบรหัสรูปภาพ' })
  }
})


module.exports = router;

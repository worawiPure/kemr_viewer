// var knex = require('knex');

module.exports = {

  search(db, hn) {
    let sql = `
      select o.hn, o.vn, o.vstdate, o.vsttime, k.department,
      DATE_FORMAT(o.vstdate, '%Y-%m') as ym
      from ovst as o
      left join kskdepartment as k on k.depcode=o.main_dep
      where o.hn=?
      and TIMESTAMPDIFF(year, o.vstdate, current_date())<=5
      order by o.vn desc
      `;
    return db.raw(sql, [hn]);
  },

  getVisitDetail(db, vn) {
    let sql = `
      select o.hn, o.vn, o.vstdate, o.vsttime, o.doctor, o.pttype, o.spclty,
      concat(o.pttype, " - ", p.name) as pttype_name, s.name as spclty_name, k.department,
      d.name as doctor_name, concat(od.icd10, " - ", icd.name) as diag,
      concat(pt.pname, pt.fname, " ", pt.lname) as ptname
      from ovst as o
      inner join patient as pt on pt.hn=o.hn
      left join pttype as p on p.pttype=o.pttype
      left join spclty as s on s.spclty=o.spclty
      left join kskdepartment as k on k.depcode=o.main_dep
      left join doctor as d on d.code=o.doctor
      left join ovstdiag as od on od.vn=o.vn and od.diagtype='1'
      left join icd101 as icd on icd.code=od.icd10
      where o.vn=? limit 1
      `;
    return db.raw(sql, [vn]);
  },

  getImageList(db, vn) {
    return db('documents')
      .where('vn', vn);
  },

  getImageData(db, id) {
    return db('documents')
      .where('id', id)
      .limit(1);
  },

  login(db, username, password) {
    return db('users')
      .where({
        username: username,
        password: password
      });
  }
}
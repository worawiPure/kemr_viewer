$(function () {

  $main = $('#main');
  // $('#jstree').jstree();

  $('#jstree').on("changed.jstree", function (e, data) {
    // console.log(data.selected);
    var act = data.selected[0];
    var spl = act.split('#');
    if (spl.length) {
      var url = '/emr/detail/' + spl[1];
      $.get(url)
        .done(function (data) {
          $main.html(data);
        });
    }
    // if (act.toUpperCase() === 'HELLO') {
    //   $.get('/hello')
    //     .done(function (data) {
    //       $main.html(data);
    //     });
    // }
  });

  $(document).on('click', 'li[data-name="lnkVisit"]', function (e) {
    console.log($(this).data('vn'));
    console.log($(this).data('hn'));
    var url = '/emr/detail/' + $(this).data('vn');
    $.get(url)
      .done(function (data) {
        $main.html(data);
      });

  });

  var doSearch = function () {

    $('#jstree').jstree('refresh');
    var query = $('#txtQuery').val();

    $.post('/emr/search', { hn: query })
      .done(function (data) {
        if (data.ok) {
          var treeData = [];

          _.forEach(data.rows, function (v) {
            var obj = {};

            obj.id = v.id;
            obj.parent = '#';
            obj.text = v.name;
            treeData.push(obj);

            if (v.visits.length) {
              _.forEach(v.visits, function (x) {
                var _obj = {};
                _obj.id = 'vn#' + x.vn;
                _obj.parent = v.id;
                var thdate = moment(x.vstdate).locale('th').format('DD MMMM YYYY');
                var time = moment(x.vsttime, 'HH:mm:ss').format('HH:mm');
                _obj.text = thdate + ' ' + 'เวลา ' + time;
                treeData.push(_obj);
              })
            }
          });
          // $('#jstree').jstree().refresh();
          $('#jstree').jstree('destroy');
          $('#jstree').jstree({
            'core': {
              'data': treeData
            }
          });
        } else {
          alert('ไม่พบรายการที่ค้นหา');
        }
      });
  }

  // search
  $('#btnSearch').on('click', function (e) {
    e.preventDefault();
    var query = $('#txtQuery').val();
    if (query) {
      doSearch();
    }

  });


  var query = $('#txtQuery').val();

  if (query) {
    doSearch();
  }
  
  $(document).on('click', 'a[data-image]', function(e) {
    e.preventDefault();
    var url = $(this).data('image-url');
    window.open(url, '_blank');
  })
  
});
var max = 0;
var total;
var codes = [];

function parseData(csv) {
  var data = {};
  var lines = csv.split(/\r?\n/);
  lines.forEach(function(line) {
    line = line.split(',');
    var country = line[0].trim();
    var code = alpha3[line[0].trim()];
    if (code) {
      data[code] = {};
      data[code].total = parseInt(line[10]);
      data[code].male = parseInt(line[1]) + parseInt(line[4]) + parseInt(line[7]);
      data[code].female = parseInt(line[2]) + parseInt(line[5]) + parseInt(line[8]);

      if (data[code].total > max) {
        max = data[code].total;
      }
    }

    if (country === 'All') {
      total = parseInt(line[10]);
    }
  });
  return data;
}

var data = parseData(getData());
var basic = new Datamap({
  element: document.getElementById('map'),
  fills: {
    defaultFill: '#FFFFFF',
  },
  data: data,
  geographyConfig: {
    popupTemplate: function(geography, data) {
      data = data ? data : { total: 0 };
      return '<div class="hoverinfo">' + geography.properties.name + ': ' + data.total + ' students' +
        '<div class="gender-bar">' + 
          '<div class="male" style="width:' + (100 * data.male / data.total) + '%;"></div>' +
          '<div class="female" style="width:' + (100 * data.female / data.total) + '%;"></div>' +
        '</div>';
    }
  },
});

var fillColor = [0, 0, 0];
var colors = {};
for (code in data) {
  var opacity = Math.max(0.05, data[code].total / max);
  colors[code] = 'rgba(' + fillColor[0] + ', ' + fillColor[1] + ', ' + fillColor[2] + ', ' + opacity + ')';
}
basic.updateChoropleth(colors);

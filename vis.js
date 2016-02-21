var BACKGROUND = '#000000';
var COLORS = [
  '#FFFFFF',
  '#CCCCCC',
  '#888888',
  '#333333'
];

var body = document.getElementsByTagName('body')[0];
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
var range = document.getElementById('range');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

function clearCanvas() {
  context.fillStyle = BACKGROUND;
  context.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSlice(center, arc, radius, color) {
  context.fillStyle = color;
  context.beginPath();
  context.arc(center.x, center.y, radius, arc.start, arc.end);
  context.lineTo(center.x, center.y);
  context.closePath();
  context.fill();
}

function drawVisualization(center, radii) {
  var sliceAngle = Math.PI * 2 / radii.length;
  for (var i = 0; i < radii.length; i++) {
    drawSlice(center, {
      start: (i - 1) * sliceAngle,
      end: (i) * sliceAngle,
    }, radii[i], COLORS[i]);
  }
}

drawVisualization({x: 300, y: 300}, [20, 32, 41, 56]);
body.appendChild(canvas);

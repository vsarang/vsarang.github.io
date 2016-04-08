var View = {
  colors: [
    '#5EB0FE',
    '#9DCFFF',
    '#D9ECFE'
  ],
  pieRadius: 200,
  rangePickerHeight: 40,

  init: function() {
    View.element = View.createDiv();
    View.threadListElement = document.getElementById('thread-list');
    View.buttonNext = document.getElementById('button-next-page');
    View.loadingScreenElement = document.getElementById('loading-screen');
    View.authButton = document.getElementById('button-auth');
    View.greetings = document.getElementById('greetings');
    View.visualization = document.getElementById('thread-vis');
    View.canvas = document.getElementById('canvas');
    View.context = View.canvas.getContext('2d');
    View.clockElement = document.getElementById('clock');

    View.canvas.width = window.innerWidth;
    View.canvas.height = window.innerHeight;

    View.canvas.onmousedown = View.setVisRangeStart;
    View.canvas.onmouseup = View.setVisRangeEnd;
    document.getElementById('button-back').onclick = View.hideVisualization;
    View.buttonNext.onclick = Visualization.nextThreadPage;;

    document.getElementsByTagName('body')[0].appendChild(View.element);
  },

  showVisualization: function() {
    if (!Visualization.thread) {
      return;
    }

    var dates = [];
    for (date in Visualization.thread.messagesByDate) {
      dates.push(date);
    }

    document.getElementById('start-date').innerHTML = 'Day 1';
    if (dates.length > 1) {
      document.getElementById('end-date').innerHTML = 'Day ' + dates.length;
    } else {
      document.getElementById('end-date').innerHTML = '';
    }

    View.visRangeStart = 0;
    View.visRangeEnd = dates.length - 1;
    View.dateRange = dates;

    View.updateVisualization();
    View.visualization.className = 'show';
  },

  setVisRangeStart: function(ev) {
    if (window.innerHeight - View.rangePickerHeight < ev.clientY) {
      View.visRangeStart = Math.floor(View.dateRange.length *  ev.clientX / window.innerWidth);
      View.visRangeEnd = View.visRangeStart;
    }
    return false;
  },

  setVisRangeEnd: function(ev) {
    if (View.visRangeStart !== undefined && window.innerHeight - View.rangePickerHeight < ev.clientY) {
      View.visRangeEnd = Math.floor(View.dateRange.length *  ev.clientX / window.innerWidth);
      View.updateVisualization();
    }
  },

  updateVisualization: function() {
    View.context.fillStyle = '#ffffff';
    View.context.fillRect(0, 0, window.innerWidth, window.innerHeight);
    
    var startIndex = Math.min(View.visRangeStart, View.visRangeEnd);
    var endIndex = Math.max(View.visRangeStart, View.visRangeEnd);

    var slices = [];
    for (var i = startIndex; i <= endIndex; i++) {
      slices.push(Visualization.thread.messagesByDate[View.dateRange[i]]);
    }

    var userLabels = [];
    var hourLabels = [];
    var messagesByContact = {};
    var messagesByHour = [];
    Visualization.thread.contacts.forEach(function(contact) {
      messagesByContact[contact] = 0;
      userLabels.push('User ' + userLabels.length);
    });
    for (var i = 0; i < 24; i++) {
      messagesByHour.push(0);
      hourLabels.push(i + ':00');
    }

    var maxUser = 0;
    var maxHour = 0;
    slices.forEach(function(slice) {
      for (contact in slice) {
        messagesByContact[contact] += slice[contact].messages;
        if (maxUser < messagesByContact[contact]) {
          maxUser = messagesByContact[contact];
        }

        for (var i = 0; i < 24; i++) {
          messagesByHour[i] += slice[contact].byHour[i];
        }
      }
    });

    for (var i = 0; i < 24; i++) {
      if (maxHour < messagesByHour[i]) {
        maxHour = messagesByHour[i];
      }
    }

    var userRadii = [];
    Visualization.thread.contacts.forEach(function(contact) {
      userRadii.push(messagesByContact[contact] / maxUser);
    });

    var hourRadii = [];
    messagesByHour.forEach(function(count) {
      hourRadii.push(count / maxHour);
    });

    View.drawPie({x: window.innerWidth / 4, y: window.innerHeight / 2}, userRadii, userLabels);
    View.drawPie({x: window.innerWidth * 3 / 4, y: window.innerHeight / 2}, hourRadii, hourLabels);
    View.drawRangePicker();
  },

  hideVisualization: function() {
    View.visualization.className = '';
  },

  showAuth: function(callback) {
    greetings.className = 'auth';
    View.authButton.onclick = callback;
    View.authButton.style.display = 'block';
  },

  hideAuth: function() {
    greetings.className = '';
    View.authButton.style.display = 'none';
  },

  showLoadingScreen: function() {
    var el = View.loadingScreenElement;
    el.style.display = 'block';
  },

  hideLoadingScreen: function() {
    var el = View.loadingScreenElement;
    el.style.display = 'none';
  },

  setLoadingBar: function(percent) {
    document.getElementById('loading-bar').style.width = (percent * 100) + '%';
  },

  addToThreadList: function(thread) {
    if (thread) {
      for (var i = 0; i < View.threadListElement.children.length; i++) {
        var child = View.threadListElement.children[i];
        if (thread.date.getTime() > child.getAttribute('date')) {
          View.threadListElement.insertBefore(View.createThreadDiv(thread), child);
          return;
        }
      }
      View.threadListElement.appendChild(View.createThreadDiv(thread));
    }
  },

  showThreadList: function(threads) {
    View.threadListElement.style.display = 'block';
    View.buttonNext.style.display = 'block';
  },

  hideThreadList: function() {
    View.threadListElement.style.display = 'none';
    View.buttonNext.style.display = 'none';
  },

  clickThread: function() {
    Visualization.selectThread(this.getAttribute('id'));
  },

  createThreadDiv: function(thread) {
    var messages = thread.messages ? thread.messages.length.toString() : 0;
    var participants = thread.contacts.size;

    var threadEl = View.createDiv('thread');
    var tooltipEl = View.createDiv('tooltip');

    var participantsEl = View.createDiv('participants', participants);
    var messagesEl = View.createDiv('messages', messages);
    var dateEl = View.createDiv('date', View.formatDate(thread.date));

    tooltipEl.appendChild(participantsEl);
    tooltipEl.appendChild(messagesEl);
    tooltipEl.appendChild(dateEl);
    threadEl.appendChild(tooltipEl);

    threadEl.onclick = View.clickThread;

    for (var i = 0; i < participants; i++) {
      threadEl.appendChild(View.createDiv('participant'));
    }

    if (messages <= 100) {
      var height = 10 + (messages - 1) * 3;
      threadEl.style.height = height + 'px';
    } else {
      threadEl.style.height = '310px';
    }

    threadEl.setAttribute('id', thread.id);
    threadEl.setAttribute('date', thread.date.getTime());
    return threadEl;
  },

  createDiv: function(className, innerHTML) {
    var div = document.createElement('div');
    if (className) div.className = className;
    if (innerHTML) div.textContent = innerHTML;
    return div;
  },

  drawPie: function(center, radii, labels) {
    var drawSlice = function(arc, radius, color, label) {
      View.context.save();

      View.context.translate(center.x, center.y);
      View.context.rotate(arc.start);

      View.context.fillStyle = color;
      View.context.beginPath();
      View.context.arc(0, 0, radius, 0, arc.end - arc.start);
      View.context.lineTo(0, 0);
      View.context.closePath();
      View.context.fill();

      View.context.strokeStyle = '#000000';
      View.context.beginPath();
      View.context.arc(0, 0, View.pieRadius, 0, arc.end - arc.start);
      View.context.lineTo(0, 0);
      View.context.closePath();
      View.context.stroke();

      View.context.fillStyle = '#000000';
      View.context.font = '20px Tahoma';
      View.context.fillText(label, View.pieRadius + 5, 20);

      View.context.restore();
    }

    var sliceAngle = Math.PI * 2 / radii.length;
    for (var i = 0; i < radii.length; i++) {
      drawSlice(
        {
          start: (i) * sliceAngle + Math.PI,
          end: (i + 1) * sliceAngle + Math.PI,
        },
        radii[i] * View.pieRadius,
        View.colors[i % (2 + (radii.length % 2))],
        labels ? labels[i] : '');
    }
  },

  drawRangePicker: function() {
    var startY = window.innerHeight - View.rangePickerHeight;
    var startIndex = Math.min(View.visRangeStart, View.visRangeEnd);
    var endIndex = Math.max(View.visRangeStart, View.visRangeEnd);
    var count = (endIndex + 1 - startIndex);
    var width = window.innerWidth / View.dateRange.length;

    View.context.fillStyle = View.colors[View.colors.length - 1];
    View.context.beginPath();
    View.context.rect(0, startY, window.innerWidth, View.rangePickerHeight); 
    View.context.fill();

    View.context.fillStyle = View.colors[0];
    View.context.beginPath();
    View.context.rect(startIndex * width, startY, count * width, View.rangePickerHeight); 
    View.context.fill();

    View.context.strokeStyle = '#ffffff';
    for (var i = 0; i < View.dateRange.length; i++) {
      View.context.beginPath();
      View.context.rect(width * i, startY, width, View.rangePickerHeight); 
      View.context.stroke();
    }
  },

  formatDate: function(date) {
    return (date.getMonth() + 1) + '/' + date.getDate() + '/'
      + (date.getFullYear() + '').slice(-2);
  },
}

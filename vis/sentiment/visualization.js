var Visualization = {
  init: function() {
    API.checkAuth();
    View.init();
  },

  start: function() {
    API.getMessages(Visualization.loadMessages, 100);
  },

  loadMessages: function(messages) {
    messages.forEach(function(message) {
      API.getMessage(message.id, Visualization.loadMessage);
    });
  },

  loadMessage: function(message) {
    if (message.payload.parts && message.payload.parts[0].mimeType === "text/plain" && message.payload.parts[0].body.size) {
      var body = window.atob(message.payload.parts[0].body.data.replace(/-/g, '+').replace(/_/g, '/'));
      var date = new Date(parseInt(message.internalDate));
      var dateString = date.toDateString();

      $.ajax({
        type: 'POST',
        url: 'http://text-processing.com/api/sentiment/',
        text: body,
        success: function(response) {
          if (!(dateString in Visualization.messages)) {
            Visualization.messages[dateString] = [];
          }
          Visualization.messages[dateString].push(response.label);
          console.log(response.label);
        }
      });
    }
  },

  cleanHeader : function(str) {
    str = str.replace(/".*?"/g, '');
    str = str.replace(/'.*?'/g, '');
    str.toLowerCase();
    return str;
  },

  getFrom: function(message) {
    var header = Visualization.cleanHeader(Visualization.getHeader(message, 'From').trim().toLowerCase());
    var email = header.match(/<.*>/);
    return (email ? email[0].slice(1, -1) : header).toLowerCase();
  },

  getTo: function(message) {
    var contacts = new Set();
    var header = Visualization.cleanHeader(Visualization.getHeader(message, 'To') + ', ' + Visualization.getHeader(message, 'Cc'));
    if (header) {
      header.split(',').forEach(function(contact) {
        contact = contact.trim()
        if (contact != '') {
          var email = contact.match(/<.*>/);
          contacts.add((email ? email[0].slice(1, -1) : contact).toLowerCase());
        }
      });
    }
    return contacts;
  },

  getHeader: function(message, match) {
    var headers = message.payload.headers;
    for (var i = 0; i < headers.length; i++) {
      if (headers[i].name.toLowerCase() === match.toLowerCase()) {
        return headers[i].value ? headers[i].value : '';
      }
    }
    return '';
  },

  getMessagesByDate: function(messages) {
    var messagesByDate = {};

    messages.forEach(function(message) {
      var date = new Date(parseInt(message.internalDate));
      var dateString = date.toDateString();

      if (!(dateString in messagesByDate)) {
        messagesByDate[dateString] = [];
      }
      messagesByDate[dateString].push(message);
    });

    return messagesByDate;
  }
};

var init = Visualization.init;

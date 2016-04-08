var Visualization = {
  init: function() {
    API.checkAuth();
    View.init();
    Visualization.threadsPerPage = 100;
  },

  start: function() {
    Visualization.page = 0;
    Visualization.pageTokens = [undefined];
    API.getThreads(Visualization.loadThreads, Visualization.threadsPerPage);
    View.showThreadList();
  },

  loadThreads: function(threads, nextPageToken) {
    if (Visualization.pageTokens.length === Visualization.page + 1) {
      Visualization.pageTokens.push(nextPageToken);
    }
    threads.forEach(function(thread) {
      API.getThread(thread.id, Visualization.loadThread);
    });
  },

  loadThread: function(thread) {
    if (thread.error) {
      return;
    }

    thread.date = new Date(0);
    thread.contacts = new Set();
    thread.messages.forEach(function(message) {
      var date = new Date(parseInt(message.internalDate));
      thread.date = thread.date < date ? date : thread.date;
      Visualization.getTo(message).forEach(function(contact) {
        thread.contacts.add(contact);
      });
      thread.contacts.add(Visualization.getFrom(message));
    });

    View.addToThreadList(thread);
  },

  nextThreadPage: function() {
    API.getThreads(
        Visualization.loadThreads,
        Visualization.threadsPerPage,
        Visualization.pageTokens[++Visualization.page]);
  },

  selectThread: function(id) {
    API.getThread(id, Visualization.loadVisualization);
  },

  loadVisualization: function(thread) {
    Visualization.thread = Visualization.getMessagesByDate(thread.messages);
    View.showVisualization();
  },

  clean : function(str) {
    str = str.replace(/".*?"/g, '');
    str = str.replace(/'.*?'/g, '');
    str.toLowerCase();
    return str;
  },

  getFrom: function(message) {
    var header = Visualization.clean(Visualization.getHeader(message, 'From').trim().toLowerCase());
    var email = header.match(/<.*>/);
    return (email ? email[0].slice(1, -1) : header).toLowerCase();
  },

  getTo: function(message) {
    var contacts = new Set();
    var header = Visualization.clean(Visualization.getHeader(message, 'To') + ', ' + Visualization.getHeader(message, 'Cc'));
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
    var thread = {
      contacts: new Set(),
      messagesByDate: {}   
    };

    messages.forEach(function(message) {
      Visualization.getTo(message).forEach(function(contact) {
        thread.contacts.add(contact);
      });
      var sender = Visualization.getFrom(message);
      thread.contacts.add(sender);

      var date = new Date(parseInt(message.internalDate));
      var dateString = date.toDateString();

      if (!(dateString in thread.messagesByDate)) {
        thread.messagesByDate[dateString] = {};
      }
      thread.contacts.forEach(function(contact) {
        if (!(contact in thread.messagesByDate[dateString])) {
          thread.messagesByDate[dateString][contact] = {
            messages: 0,
            byHour: []
          };
          for (var i = 0; i < 24; i++) {
            thread.messagesByDate[dateString][contact].byHour.push(0);
          }
        }
      });
      thread.messagesByDate[dateString][sender].messages++;
      thread.messagesByDate[dateString][sender].byHour[date.getHours()]++;
    });

    return thread;
  }
};

var init = Visualization.init;

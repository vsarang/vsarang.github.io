'test'
var CLIENT_ID = '402772854115-8sqj514pqs6k9qo9csm1qite8i3ml0i4.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

var API = {
  checkAuth: function() {
    gapi.auth.authorize(
      { client_id: CLIENT_ID, scope: SCOPES.join(' '), immediate: true },
      API.handleAuthResult);
  },

  handleAuthResult: function (authResult) {
    if (authResult && !authResult.error) {
      View.hideAuth();
      API.loadGmailApi();
    } else {
      View.showAuth(API.handleAuthClick);
    }
  },

  handleAuthClick: function (event) {
    gapi.auth.authorize(
      { client_id: CLIENT_ID, scope: SCOPES, immediate: false },
      API.handleAuthResult);
    return false;
  },

  loadGmailApi: function () {
    gapi.client.load('gmail', 'v1', Visualization.start);
  },

  getThreads: function(callback, maxResults, pageToken) {
    var request = gapi.client.gmail.users.threads.list({
      userId: 'me',
      maxResults: maxResults,
      pageToken: pageToken
    });

    request.execute(function(response) {
      callback(response.threads, response.nextPageToken);
    });
  },

  getThread: function(threadId, callback) {
    var request = gapi.client.gmail.users.threads.get({
      'userId': 'me',
      'id': threadId
    });
    request.execute(callback);
  },

  getMessage: function(messageId, callback) {
    var request = gapi.client.gmail.users.messages.get({
      'userId': 'me',
      'id': messageId
    });
    request.execute(callback);
  }
};

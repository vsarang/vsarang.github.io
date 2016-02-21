var CLIENT_ID = '402772854115-8sqj514pqs6k9qo9csm1qite8i3ml0i4.apps.googleusercontent.com';
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];

var Auth = {
  function checkAuth() {
    gapi.auth.authorize(
      {
        'client_id': CLIENT_ID,
        'scope': SCOPES.join(' '),
        'immediate': true
      }, Auth.handleAuthResult);
  }

  function handleAuthResult(authResult) {
    var authorizeDiv = document.getElementById('authorize-div');
    if (authResult && !authResult.error) {
      // Hide auth UI, then load client library.
      authorizeDiv.style.display = 'none';
      Auth.loadGmailApi();
    } else {
      // Show auth UI, allowing the user to initiate authorization by
      // clicking authorize button.
      authorizeDiv.style.display = 'inline';
    }
  }

  function handleAuthClick(event) {
    gapi.auth.authorize(
      {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
      Auth.handleAuthResult);
    return false;
  }

  function loadGmailApi() {
    gapi.client.load('gmail', 'v1', Auth.listLabels);
  }

  function listLabels() {
    var request = gapi.client.gmail.users.labels.list({
      'userId': 'me'
    });

    request.execute(function(resp) {
      var labels = resp.labels;
      Auth.appendPre('Labels:');

      if (labels && labels.length > 0) {
        for (i = 0; i < labels.length; i++) {
          var label = labels[i];
          Auth.appendPre(label.name)
        }
      } else {
        Auth.appendPre('No Labels found.');
      }
    });
  }

  function appendPre(message) {
    var pre = document.getElementById('output');
    var textContent = document.createTextNode(message + '\n');
    pre.appendChild(textContent);
  }
};

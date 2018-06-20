// Dependencies
var express = require('express'),
    OpenTok = require('opentok');

// Verify that the API Key and API Secret are defined
var apiKey = process.env.API_KEY,
    apiSecret = process.env.API_SECRET;
if (!apiKey || !apiSecret) {
  console.log('You must specify API_KEY and API_SECRET environment variables');
  process.exit(1);
}

// Initialize the express app
var app = express();
app.use(express.static(__dirname + '/public'));

// Initialize OpenTok
var opentok = new OpenTok(apiKey, apiSecret);

init();


app.get('/', function(req, res) {
  res.render('index.ejs');
});


/* --------------- Study Group --------------- */

app.get('/studygroup/:groupname', function(req, res) {
  var groupName = req.param('groupname');

  //If the session under that group name doesn't exist
  if (!app.get(groupName)){
    // Create a session and store it in the express app
    opentok.createSession({mediaMode:"routed"}, function(err, session) {
      if (err) throw err;
      app.set(groupName, session.sessionId);
      getToken(groupName, res);
    });

  } else {
    getToken(groupName, res);
  }
});

function getToken(groupName, res) {
  var sessionId = app.get(groupName);

  // generate a fresh token for this client
  var token = opentok.generateToken(sessionId);

  res.render('studygroup.ejs', {
    apiKey: apiKey,
    sessionId: sessionId,
    token: token
  });
}


/*--------------- Archiving ---------------*/

app.post('/start', function(req, res) {
  
  opentok.startArchive(app.get('sessionId'), {
    name: 'Archive',

  }, function(err, archive) {

    if (err) return res.send(500,
      console.log('Could not start archive for session '+app.get('sessionId')+'. error='+err.message)
    );
      console.log("err= "+err);
    res.json(archive);
  });
});

app.get('/stop/:archiveId', function(req, res) {
  var archiveId = req.param('archiveId');
  opentok.stopArchive(archiveId, function(err, archive) {
    if (err) return res.send(500, 'Could not stop archive '+archiveId+'. error='+err.message);
    res.json(archive);
  });
});

/*--------------- Historical Archives ---------------*/
app.get('/history', function(req, res) {
  var page = req.param('page') || 1,
      offset = (page - 1) * 5;
  opentok.listArchives({ offset: offset, count: 5 }, function(err, archives, count) {
    if (err) return res.send(500, 'Could not list archives. error=' + err.message);
    res.render('history.ejs', {
      archives: archives,
      showPrevious: page > 1 ? ('/history?page='+(page-1)) : null,
      showNext: (count > offset + 5) ? ('/history?page='+(page+1)) : null
    });
  });
});

//Delete an archive
app.get('/delete/:archiveId', function(req, res) {
  var archiveId = req.param('archiveId');
  opentok.deleteArchive(archiveId, function(err) {
    if (err) return res.send(500, 'Could not stop archive '+archiveId+'. error='+err.message);
    res.redirect('/history');
  });
});

//Downloads an archive to view
app.get('/download/:archiveId', function(req, res) {
  var archiveId = req.param('archiveId');
  opentok.getArchive(archiveId, function(err, archive) {
    if (err) return res.send(500, 'Could not get archive '+archiveId+'. error='+err.message);
    res.redirect(archive.url);
  });
});

/*--------------------------------------------------*/

// Start the express app
function init() {
  const port = process.env.PORT || 3000;
  app.listen(port, function() {
    console.log('You\'re app is now ready at http://localhost:3000/');
  });
}

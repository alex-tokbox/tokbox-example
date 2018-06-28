// Dependencies
var express = require('express'),
    OpenTok = require('opentok');
    request = require('request');
    jwt = require('jsonwebtoken');
    bodyParser = require('body-parser');

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
app.use(bodyParser.json());

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
      getToken(groupName, res, "pip");
    });
    session = groupName;

  } else {
    getToken(groupName, res);
  }
});

// generate a fresh token for this client
function getToken(groupName, res, layout) {
  var sessionId = app.get(groupName);
  //Changes the default layoutclass to customize the archive format
  if(layout === "pip"){
    var token = opentok.generateToken(sessionId, {
      initialLayoutClassList: ['full']
    });
  } else {
    var token = opentok.generateToken(sessionId);
  }
  
  res.render('studygroup.ejs', {
    apiKey: apiKey,
    sessionId: sessionId,
    token: token
  });
}


/*--------------- Archiving ---------------*/

app.post('/start/:sessionid', function(req, res) {
  var sessionId = req.param('sessionid');
  archiveFormat(sessionId);
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

/*----------------- Archive composition -------------*/
function archiveFormat(sessionId){

 
  const headers = () => {
    const createToken = () => {
      const options = {
        issuer: apiKey,
        expiresIn: '1m',
      };
      return jwt.sign({ ist: 'project' }, apiSecret, options);
    };

    return { 
      'X-OPENTOK-AUTH': createToken(),
      'Content-Type': 'application/json'
    };
  };
  request.post({
    headers: headers(),
    url: 'https://api.opentok.com/v2/project/' + apiKey + '/archive',
    json: {
        "sessionId": sessionId,
        "layout": {
          "type": "pip"
        },
        "name" : "Archive",
        "outputMode" : "composed",
      }
  },function(error, response, body) {
      if (error) {
        console.log('error', error);
      }
    });
}

/*----------------- Lecture -------------------*/


app.get('/lecture/:lecturename/:role', function(req, res) {
  var lectureName = req.param('lecturename');
  var role = req.param('role');

  if (role === "teacher"){
    console.log("role = teacher");
    teacherJoins(lectureName, req, res);
  } else if (role === "student") {
    console.log("role = student");
    studentJoins(lectureName, req, res);

  } else if (role === "lurker") {
    console.log("role = lurker");
    lurkerJoins(lectureName, req, res);

  } else {
    console.log("invalid role");
  }
});


//When a teacher creates a lecture, give them a moderator token and load the teacher view
function teacherJoins(lectureName, req, res){
   //Teacher (first person to join lecture)
  if (!app.get(lectureName)){
    // Create a session and store it in the express app
    opentok.createSession({mediaMode:"routed"}, function(err, session) {
      if (err) throw err;
      app.set(lectureName, session.sessionId);
      // generate a moderator token for the teacher

      var tokenOptions = {};
      tokenOptions.role = "moderator";
      tokenOptions.data = "role=teacher";
      var token = opentok.generateToken(session.sessionId, tokenOptions);

      res.render('lecture-teacher.ejs', {
        apiKey: apiKey,
        sessionId: session.sessionId,
        token: token
      });
    });
  } else {
    console.log("Sorry, lecture already exists");
  }
}


//When a student joins a lecture, give them a publisher token and load the student view
function studentJoins(lectureName, req, res) {
  
  if (!app.get(lectureName)){
    console.log("Sorry, lecture does not exist");
  } else {
    var session = app.get(lectureName);
    // generate a publisher token
    var tokenOptions = {};
      tokenOptions.role = 'publisher';
      tokenOptions.data = "role=student";
    var token = opentok.generateToken(session, tokenOptions);

    res.render('lecture-student.ejs', {
      apiKey: apiKey,
      sessionId: session,
      token: token
    });
  }
}

//Need to implement
//When a lurker joins a lecture, give them a subscriber token
function lurkerJoins(lectureName, req, res){
  console.log('I\'m a lurker!');
  var session = app.get(lectureName);
  // generate a publisher token
  var tokenOptions = {};
    tokenOptions.role = 'subscriber';
    tokenOptions.data = "role=lurker";
  var token = opentok.generateToken(session, tokenOptions);
}

// Start the express app
function init() {
  const port = process.env.PORT || 3000;
  app.listen(port, function() {
    console.log('You\'re app is now ready at http://localhost:3000/');
  });
}

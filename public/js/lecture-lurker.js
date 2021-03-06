
/* --------------- Basic Video Chat --------------- */

// Initialize an OpenTok Session object
var session = OT.initSession(apiKey, sessionId, {connectionEventsSuppressed: true});

OT.setLogLevel(OT.DEBUG);

// Attach event handlers
session.on({

  // This function runs when another client publishes a stream (eg. session.publish())
  streamCreated: function(event) {

    if(event.stream.name === "teacher") {
      console.log("teacher");

      var data = event.stream.connection.data;
      //finds where the name= portion of the data starts and returns the substring after it.
      var name = data.substring(data.indexOf("name=") + 5);

      var options = {fitMode: 'contain', width: '100%', height: '100%', name: name + ' (Teacher)'};
      var teacher = document.getElementById('teacher');
      SpeakerDetection(session.subscribe(event.stream, teacher, options));
    } else {
      console.log("student");
          
      var subContainer = document.createElement('div');
      var options = {subscribeToAudio: true, subscribeToVideo: false, insertDefaultUI: false};

      subContainer.id = 'stream-' + event.stream.streamId;
      subContainer.className = "subscriber";

      document.getElementById('subscribers').appendChild(subContainer);

      // Subscribe to the stream that caused this event, put it inside the container we just made
      SpeakerDetection(session.subscribe(event.stream, options));
    }

      console.log("streamCreated");
  },

  streamDestroyed: function(event) {

    console.log("streamDestroyed");
  }

});

var SpeakerDetection = function(subscriber) {
  var activity = null;
  var data = subscriber.stream.connection.data;
  var name = data.substring(data.indexOf("name=") + 5);

  subscriber.on('audioLevelUpdated', function(event) {
    var now = Date.now();
    if (event.audioLevel > 0.2) {
      if (!activity) {
        activity = {timestamp: now, talking: false};
      } else if (activity.talking) {
        activity.timestamp = now;
      } else if (now - activity.timestamp > 1000) {
        // detected audio activity for more than 1s
        // for the first time.
        activity.talking = true;
        startTalking(name);
      }
    } else if (activity && now - activity.timestamp > 3000) {
      // detected low audio activity for more than 3s
      if (activity.talking) {
        stopTalking(name);
      }
      activity = null;
    }
  });
}

var startTalking =  function(name) {
  console.log(name + ": started talking");
  var speaker = document.getElementById("speaker");
  speaker.innerHTML = "<h2>Speaking: " + name + "</h2>";
}

var stopTalking = function() {
  console.log(name + ": stopped talking");
  var speaker = document.getElementById("speaker");
  speaker.innerHTML = "<h2>Speaking: None</h2>";
}

// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);

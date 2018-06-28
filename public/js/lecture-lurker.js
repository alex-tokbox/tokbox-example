
/* --------------- Basic Video Chat --------------- */

// Initialize an OpenTok Session object
var session = OT.initSession(apiKey, sessionId);

OT.setLogLevel(OT.DEBUG);

// Attach event handlers
session.on({

  // This function runs when another client publishes a stream (eg. session.publish())
  streamCreated: function(event) {

    if(event.stream.name === "teacher") {
      console.log("teacher");
      var options = {fitMode: 'contain', width: '100%', height: '100%'};
      var teacher = document.getElementById('teacher');
      session.subscribe(event.stream, teacher, options);
    } else {
      console.log("student");
          // Create a container for a new Subscriber, assign it an id using the streamId, put it inside
      // the element with id="subscribers"
      var subContainer = document.createElement('div');
      var options = {subscribeToAudio: true, subscribeToVideo: false, insertDefaultUI: false};

      subContainer.id = 'stream-' + event.stream.streamId;
      subContainer.className = "subscriber";

      document.getElementById('subscribers').appendChild(subContainer);

      // Subscribe to the stream that caused this event, put it inside the container we just made
      session.subscribe(event.stream, options);
    }

      console.log("streamCreated");
  },

  streamDestroyed: function(event) {

    console.log("streamDestroyed");
  }

});

// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);

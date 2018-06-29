
/* --------------- Basic Video Chat --------------- */

// Initialize an OpenTok Session object
var session = OT.initSession(apiKey, sessionId);

// Initialize a Publisher, and place it into the element with id="publisher"
var publisher = OT.initPublisher('publisher', {fitMode: 'contain', width: '100%', height: '100%'});

OT.setLogLevel(OT.DEBUG);

// Attach event handlers
session.on({

  // This function runs when session.connect() asynchronously completes
  sessionConnected: function(event) {
    // Publish the publisher we initialzed earlier (this will trigger 'streamCreated' on other
    // clients)

    session.publish(publisher);
    console.log("Token: " + token);

  },

  // This function runs when another client publishes a stream (eg. session.publish())
  streamCreated: function(event) {

    if(event.stream.connection.data.includes("role=teacher")) {
      console.log("teacher");
      var data = event.stream.connection.data;
      //finds where the name= portion of the data starts and returns the substring after it.
      var name = data.substring(data.indexOf("name=") + 5);

      var options = {fitMode: 'contain', width: '100%', height: '100%', name: name + ' (Teacher)'};
      var teacher = document.getElementById('teacher');
      session.subscribe(event.stream, teacher, options);

    } else if(event.stream.connection.data.includes("role=student")){
      console.log("student");
          // Create a container for a new Subscriber, assign it an id using the streamId, put it inside
      // the element with id="subscribers"
      var subContainer = document.createElement('div');
      var options = {fitmode: 'contain', width: '100%', height: '100%', subscribeToAudio: true, subscribeToVideo: false};

      subContainer.id = 'stream-' + event.stream.streamId;
      subContainer.className = "subscriber";

      document.getElementById('subscribers').appendChild(subContainer);
      document.getElementById('subscribers').className = "students";
      session.subscribe(event.stream, subContainer, options);

    } else {

      console.log("Error with role");
    }
  },

  streamDestroyed: function(event) {

    console.log("streamDestroyed");
  }

});

// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);

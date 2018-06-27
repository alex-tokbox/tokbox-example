
/* --------------- Basic Video Chat --------------- */

// Initialize an OpenTok Session object
var session = OT.initSession(apiKey, sessionId);

// Initialize a Publisher, and place it into the element with id="publisher"
var publisher = OT.initPublisher('publisher', {fitMode: 'contain', width: '100%', height: '100%', name:'teacher'});

OT.setLogLevel(OT.DEBUG);

// Attach event handlers
session.on({

  // This function runs when session.connect() asynchronously completes
  sessionConnected: function(event) {
    // Publish the publisher we initialzed earlier (this will trigger 'streamCreated' on other
    // clients)
    var name = session.connection.data;

    session.publish(publisher);
    console.log("Token: " + token);

  },

  // This function runs when another client publishes a stream (eg. session.publish())
  streamCreated: function(event) {
    // Create a container for a new Subscriber, assign it an id using the streamId, put it inside
    // the element with id="subscribers"
    var subContainer = document.createElement('div');
    var options = {fitMode: 'contain', width: '100%', height: '100%'};

    subContainer.id = 'stream-' + event.stream.streamId;
    subContainer.className = "subscriber";

    document.getElementById('subscribers').appendChild(subContainer);

    // Subscribe to the stream that caused this event, put it inside the container we just made
    session.subscribe(event.stream, subContainer, options);
      console.log("streamCreated");
    },

  streamDestroyed: function(event) {

    console.log("streamDestroyed");
  }

});

// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);


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
    var wrapper = document.createElement('div');
    wrapper.id = "wrapper:" + event.stream.connection.id;
    wrapper.classList.add('wrapper');
    var buttons = document.createElement('div');
    buttons.classList.add('buttons');
    
    //Adds button to lower hand
    var lowerHandBtn = createHDButton(event);
    buttons.appendChild(lowerHandBtn);

    //Adds button to force student to stop publishing
    var stopPublishBtn = createSPButton(event);
    buttons.appendChild(stopPublishBtn);

    //Adds button to force student disconnect
    var forceDisconnect = createFDButton(event);
    buttons.appendChild(forceDisconnect);

    //Adds not viewing text (Not a button)
    var notViewing = createNotViewingText(event);
    //buttons.appendChild(notViewing);

    var data = event.stream.connection.data;
    //finds where the name= portion of the data starts and returns the substring after it.
    var name = data.substring(data.indexOf("name=") + 5);
    console.log("student name is: " + name);

    var options = {fitMode: 'contain', width: '100%', height: '100%', name: name};

    subContainer.id = event.stream.connection.id;
    subContainer.className = "subscriber";

    
    wrapper.appendChild(subContainer);
    wrapper.appendChild(buttons);
    wrapper.appendChild(notViewing);
    document.getElementById('subscribers').appendChild(wrapper);

    // Subscribe to the stream that caused this event, put it inside the container we just made
    session.subscribe(event.stream, subContainer, options);

  
      console.log("streamCreated");
    },

  streamDestroyed: function(event) {
    console.log("streamDestroyed");

    var connectionId = event.stream.connection.connectionId;
    var data = event.stream.connection.data;
    var name = data.substring(data.indexOf("name=") + 5);

    document.getElementById("wrapper:" + connectionId).innerHTML = name;

  },

  connectionDestroyed: function(event) {
    
    var connectionId = event.connection.connectionId;

    console.log("connectionDestroyed: " + connectionId);
    //removes wrapper containing stream
    document.getElementById("wrapper:" + connectionId).remove();
  }

});

function createHDButton(event) {
  var lowerHandBtn = document.createElement('button');
  lowerHandBtn.innerHTML = 'Lower Hand';
  lowerHandBtn.classList.add('studentBtn', 'btn', 'btn-primary');
  var studentConnection = event.stream.connection;
  lowerHandBtn.addEventListener('click', function(){
    console.log("studentHandDown");
    session.signal({
      type: 'handraise',
      to: studentConnection,
      data: 'down'
    }, function signalCallback(error) {
      if(error){
        console.log("hand down error: " + error.message);
      } else {
        console.log("hand down sent");
      }
    });
    var studentId = event.stream.connection.connectionId;
    $('#' + studentId).removeClass("hand-raised");
  });
  return lowerHandBtn;
}

function createSPButton(event) {
  var stopPublishBtn = document.createElement('button');
  stopPublishBtn.innerHTML = 'Stop Stream';
  stopPublishBtn.classList.add('studentBtn', 'btn', 'btn-primary');
  var studentStream = event.stream;

  stopPublishBtn.addEventListener('click', function(){
    session.forceUnpublish(studentStream);
  });
  return stopPublishBtn;
}

function createFDButton(event) {
  var forceDisconnectBtn = document.createElement('button');
  forceDisconnectBtn.innerHTML = 'Force Disconnect';
  forceDisconnectBtn.classList.add('studentBtn', 'btn', 'btn-primary');
  var studentConnection = event.stream.connection;

  forceDisconnectBtn.addEventListener('click', function(){
    session.forceDisconnect(studentConnection);
  });
  return forceDisconnectBtn;
}

function createNotViewingText(event) {
  var h3 = document.createElement('H3');
  var text = document.createTextNode("Not Viewing");

  h3.appendChild(text);

  h3.classList.add('view-text', 'invisible');
  h3.id = "nvt-" + event.stream.connection.id;

  return h3;
}

//Receiving a handraise signal
session.on('signal:handraise', function signalCallback(event) {
  console.log("data = " + event.data);
  var studentId = event.from.id;

  if(event.data === "up") {
    $('#' + studentId).addClass("hand-raised");
  } else if (event.data === "down") {
    $('#' + studentId).removeClass("hand-raised");
  }

});

//Receiving a viewing signal
session.on('signal:viewstate', function signalCallback(event) {
  console.log("hidden: " + event.data);
  var isHidden = event.data;
  var studentId = event.from.id;
  var h3 = $('#nvt-' + studentId);
  console.log(h3);

  if(isHidden == "true") {
    h3.removeClass("invisible");
  } else {
    h3.addClass("invisible");
  }

});


// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);

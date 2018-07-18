
/* --------------- Basic Video Chat --------------- */

// Initialize an OpenTok Session object
var session = OT.initSession(apiKey, sessionId);

// Initialize a Publisher, and place it into the element with id="publisher"
var publisher = OT.initPublisher('publisher', {fitMode: 'contain', width: '100%', height: '100%'});

var teacherConnection = null;
var teacherSubscriber = null;
var totalBytes = 0;

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

      var data = event.stream.connection.data;
      //finds where the name= portion of the data starts and returns the substring after it.
      var name = data.substring(data.indexOf("name=") + 5);

    if(event.stream.connection.data.includes("role=teacher")) {
      console.log("teacher");


      var options = {fitMode: 'contain', width: '100%', height: '100%', name: name + ' (Teacher)'};
      var teacher = document.getElementById('teacher');

      teacherSubscriber = session.subscribe(event.stream, teacher, options);
      teacherConnection = event.stream.connection;


    } else if(event.stream.connection.data.includes("role=student")){
      console.log("student");
          // Create a container for a new Subscriber, assign it an id using the streamId, put it inside
      // the element with id="subscribers"
      var subContainer = document.createElement('div');
      var options = {fitmode: 'contain', width: '100%', height: '100%', subscribeToAudio: true, subscribeToVideo: false, name: name};

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
  },

  connectionDestroyed: function(event) {
    console.log("connectionDestroyed");
    var students = document.getElementById("subscribers");
    console.log("child nodes" + students.hasChildNodes());
    if (students.hasChildNodes() == false){
      $('#subscribers').removeClass('students');
    }
  }

});


/* --------------- Hand Raising --------------- */

//When the teacher tells the student to put their hand down
session.on('signal:handraise', function signalCallback(event) {
  $("#lower-hand").hide();
  $("#raise-hand").show();
  $('#publisher').removeClass("hand-raised");
  console.log("received signal");
});


var raiseHand = document.getElementById('raise-hand');
var lowerHand = document.getElementById('lower-hand');


// Send a signal once the user clicks on the raise hand button
raiseHand.addEventListener('click', function() {
  session.signal({
    type: 'handraise',
    to: teacherConnection,
    data: 'up'
  }, function signalCallback(error) {
    if(error){
      console.log("hand up error: " + error.message);
    } else {
      console.log("hand up sent");
    }
  });

  $("#raise-hand").hide();
  $("#lower-hand").show();
  $('#publisher').addClass("hand-raised");

});

// Send a signal once the user clicks on the lower hand button
lowerHand.addEventListener('click', function() {
  session.signal({
    type: 'handraise',
    to: teacherConnection,
    data: 'down'
  }, function signalCallback(error) {
    if(error){
      console.log("hand down error: " + error.message);
    } else {
      console.log("hand down sent");
    }
  });

  $("#lower-hand").hide();
  $("#raise-hand").show();
  $('#publisher').removeClass("hand-raised");

});

/* --------------- Mute audio --------------- */

var muteAudio = document.getElementById('mute');
var unmuteAudio = document.getElementById('unmute');

muteAudio.addEventListener('click', function() {

  publisher.publishAudio(false);
  $("#mute").hide();
  $("#unmute").show();
})

unmuteAudio.addEventListener('click', function() {
  publisher.publishAudio(true);
  $("#unmute").hide();
  $("#mute").show();
})

/* ---------- Viewing page check ------------ */

document.addEventListener("visibilitychange", function(){
  
  var notViewing = document.hidden.toString();
  console.log("hidden: " + notViewing);

  session.signal({
    type: 'viewstate',
    to: teacherConnection,
    data: notViewing
  }, function signalCallback(error) {
    if(error){
      console.log("isViewing error: " + error.message);
    } else {
      console.log("viewstate sent");
    }
  });
});


$(document).ready(function() {
  $("#lower-hand").hide();
  $("#unmute").hide();

  //gets framerate and bitrate from the teacher and updates the UI every second
  setInterval(function(){
    teacherSubscriber.getStats(function completionHandler(error, stats) {
      var frameRate = stats.video.frameRate;
      var bytesReceived = stats.video.bytesReceived;
      document.getElementById("bitrate").innerHTML = "(" + frameRate + "fps, " + (bytesReceived - totalBytes)/1000 + "KB/s)";
      totalBytes = bytesReceived;
    });
  }, 1000);
  //
});

function updateStats(error) {
  //console.log(stats.audio.bytesReceived);
  console.log("1 sec");
}




// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);

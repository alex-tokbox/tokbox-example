
/* --------------- Basic Video Chat --------------- */

// Initialize an OpenTok Session object
var session = OT.initSession(apiKey, sessionId);

// Initialize a Publisher, and place it into the element with id="publisher"
var publisher = OT.initPublisher('publisher', {fitMode: 'contain', width: '100%', height: '100%'});

OT.setLogLevel(OT.DEBUG);

var videoStreams = 1;
var screenShared = false;

// Attach event handlers
session.on({

  // This function runs when session.connect() asynchronously completes
  sessionConnected: function(event) {
    // Publish the publisher we initialzed earlier (this will trigger 'streamCreated' on other
    // clients)

    session.publish(publisher);

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

    //keeps track of number of streams.
    videoStreams++;

    if(event.stream.videoType === "screen"){
      screenShared = true;
      console.log("screen shared");
      //Adds custom classes to change layout of page
      $("#subscribers").attr('id', 'subscribers-screenshare');
      $("#publisher").attr('id', 'publisher-screenshare');
      subContainer = document.getElementById('screen-preview');

      //prevents other participants from also sharing screen
      $(".shareScreen").hide();
    }

    // Subscribe to the stream that caused this event, put it inside the container we just made
    session.subscribe(event.stream, subContainer, options);
  },

  streamDestroyed: function(event) {
    videoStreams--;
    console.log("stream destroyed");
    if(event.stream.videoType === "screen"){
      screenShared = false;
      $("#subscribers-screenshare").attr('id', 'subscribers');
      $("#publisher-screenshare").attr('id', 'publisher');
      console.log("screen unshared");

      //Recreates the div that was destroyed
      var videoDiv = document.getElementById("videos");
      var newScreenDiv = document.createElement("div");
      newScreenDiv.id = "screen-preview";
      videoDiv.appendChild(newScreenDiv);

      //allows other participants to share screen
      $(".shareScreen").show();
    }
  },

  connectionCreated: function(event) {
    console.log("Created");
  }

});

// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);
/* ------------------ Signaling ------------------- */

// Receive a message and append it to the history
var msgHistory = document.querySelector('#history');
session.on('signal:msg', function signalCallback(event) {
  var msg = document.createElement('p');
  var senderName = event.from.data;
  msg.textContent = senderName + " : " + event.data;
  msg.className = event.from.connectionId === session.connection.connectionId ? 'mine' : 'theirs';
  msgHistory.appendChild(msg);
  msg.scrollIntoView();
});


var form = document.querySelector('form');
var msgTxt = document.querySelector('#msgTxt');

// Send a signal once the user enters data in the form
form.addEventListener('submit', function submit(event) {
  event.preventDefault();

  session.signal({
    type: 'msg',
    data: msgTxt.value
  }, function signalCallback(error) {
    if (error) {
      console.error('Error sending signal:', error.name, error.message);
    } else {
      msgTxt.value = '';
    }
  });
});

/* --------------- Archiving --------------- */

session.on('archiveStarted', function(event) {
  archiveID = event.id;
  console.log("ARCHIVE STARTED");
  $(".start").hide();
  $(".stop").show();
});

session.on('archiveStopped', function(event) {
  archiveID = null;
  console.log("ARCHIVE STOPPED");
  $(".start").show();
  $(".stop").hide();
});

$(document).ready(function() {
  $(".start").click(function (event) {
    $.post("/start/" + session.sessionId);
  }).show();
  $(".stop").click(function(event){
    $.get("/stop/" + archiveID);
  }).hide();

/* --------------- Screen Sharing --------------- */

  $(".shareScreen").show();
  $(".stopScreen").hide();
});

var screenPublisher;

var screenShare = document.querySelector(".shareScreen"); 
var stopShare = document.querySelector(".stopScreen");

stopShare.addEventListener('click', function submit(event) {
  session.unpublish(screenPublisher);
  
  //Modifies page formatting to go back to the standard view
  $(".shareScreen").show();
  $(".stopScreen").hide();
  $("#subscribers-screenshare").attr('id', 'subscribers');
  $("#publisher-screenshare").attr('id', 'publisher');
  
  //Recreates the div that was destroyed
  var videoDiv = document.getElementById("videos");
  var newScreenDiv = document.createElement("div");
  newScreenDiv.id = "screen-preview";
  videoDiv.appendChild(newScreenDiv);

});

//Extension registration
OT.registerScreenSharingExtension('chrome', 'ghdnbnpmbdjgggfaljdomeghjkdjnalk', 2.0);

screenShare.addEventListener('click', function submit(event) {

  //Adds custom classes to change layout of page
  $("#subscribers").attr('id', 'subscribers-screenshare');
  $("#publisher").attr('id', 'publisher-screenshare');

  $(".shareScreen").hide();
  $(".stopScreen").show();


  OT.checkScreenSharingCapability(function(response) {
    if(!response.supported || response.extensionRegistered === false) {
      // This browser does not support screen sharing.

    //For chrome
    // } else if (response.extensionInstalled === false) {
    //   // Prompt to install the extension.
    //   console.log("install extension");
    //   console.log("Extension Installed: " + response.extensionInstalled);
    //   console.log("extension registered: " + response.extensionRegistered);
    } else {
      // Screen sharing is available. Publish the screen.
      console.log("good to go");
      screenPublisher = OT.initPublisher('screen-preview',
        {videoSource: 'screen', fitMode: 'contain', width: '100%', height: '100%'},
        function(error) {
          if (error) {
            // Look at error.message to see what went wrong.
          } else {
            session.publish(screenPublisher, function(error) {
              if (error) {
                // Look error.message to see what went wrong.
              }
            });
          }
        }
      );
    }
  });
});


//To maintain aspect ratio
// $( window ).resize(function() {
//   $(".subscriber").height($( ".subscriber" ).width() * 0.75);
// });

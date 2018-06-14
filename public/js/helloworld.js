
/* --------------- Basic Video Chat --------------- */

// Initialize an OpenTok Session object
var session = OT.initSession(apiKey, sessionId);

// Initialize a Publisher, and place it into the element with id="publisher"
var publisher = OT.initPublisher('publisher');

OT.setLogLevel(OT.DEBUG);

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
    subContainer.id = 'stream-' + event.stream.streamId;
    document.getElementById('subscribers').appendChild(subContainer);

    // Subscribe to the stream that caused this event, put it inside the container we just made
    session.subscribe(event.stream, subContainer);
  }

});

// Connect to the Session using the 'apiKey' of the application and a 'token' for permission
session.connect(token);
/* ------------------ Signaling ------------------- */

// Receive a message and append it to the history
var msgHistory = document.querySelector('#history');
session.on('signal:msg', function signalCallback(event) {
  var msg = document.createElement('p');
  msg.textContent = event.data;
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
    $.post("/start");
  }).show();
  $(".stop").click(function(event){
    $.get("stop/" + archiveID);
  }).hide();
});

/* --------------- Screen Sharing --------------- */

var screenShare = document.querySelector(".shareScreen");
OT.registerScreenSharingExtension('chrome', 'dcpgfodbnibankobonmfdpofmnfoogch', 1.4);

screenShare.addEventListener('click', function submit(event) {

  console.log("click success");
  OT.checkScreenSharingCapability(function(response) {
    console.log("OT.checkscreensharingcapability function");
    if(!response.supported || response.extensionRegistered === false) {
      // This browser does not support screen sharing.
      console.log("response: " + response);
      console.log("response supported: " + response.supported);
      console.log("extension registered: " + response.extensionRegistered);
      console.log("does not support");
    } else if (response.extensionInstalled === false) {
      // Prompt to install the extension.
      console.log("install extension");
    } else {
      // Screen sharing is available. Publish the screen.
      console.log("good to go");
      var screenPublisher = OT.initPublisher('screen-preview',
        {videoSource: 'screen'},
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

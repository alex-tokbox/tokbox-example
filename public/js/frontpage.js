var studygroup = document.getElementById('studygroup');
var message = document.getElementById('messagetxt');

// Send a signal once the user enters data in the form
studygroup.addEventListener('submit', function submit(event) {
  event.preventDefault();
  //redirects user to their specific session.
  window.location.replace(window.location.href + "studygroup/" + message.value);
});

console.log("2 " + studygroup);
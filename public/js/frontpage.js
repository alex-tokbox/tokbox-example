var studyGroup = document.getElementById('studygroup');
var groupName = document.getElementById('groupname');

// Send a signal once the user enters data in the form
studyGroup.addEventListener('submit', function submit(event) {
  event.preventDefault();
  //redirects user to their specific session.
  window.location.replace(window.location.href + "studygroup/" + groupName.value);
});
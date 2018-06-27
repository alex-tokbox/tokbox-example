var studyGroup = document.getElementById('studygroup');
var groupName = document.getElementById('groupname');

var lectureCreate = document.getElementById('lecture-create');
var lectureNameCreate = document.getElementById('lecturename-teacher');

var lectureJoin = document.getElementById('lecture-join');
var lectureNameJoin = document.getElementById('lecturename-student');

//When someone trys to join a group
studyGroup.addEventListener('submit', function submit(event) {
  event.preventDefault();
  window.location.replace(window.location.href + "studygroup/" + groupName.value);
});

//When someone trys to create a lecture
lectureCreate.addEventListener('submit', function submit(event) {
  event.preventDefault();
  window.location.replace(window.location.href + "lecture/" + lectureNameCreate.value + "/teacher");
});

//When someone trys to join a lecture
lectureJoin.addEventListener('submit', function submit(event) {
  event.preventDefault();
  window.location.replace(window.location.href + "lecture/" + lectureNameJoin.value + "/student");
});
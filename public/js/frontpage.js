var studyGroup = document.getElementById('studygroup');
var groupName = document.getElementById('groupname');
var name = document.getElementById('name');

var lectureCreate = document.getElementById('lecture-create');
var lectureNameCreate = document.getElementById('lecturename-teacher');
var teacherName = document.getElementById('name-teacher');

var lectureJoin = document.getElementById('lecture-join');
var lectureNameJoin = document.getElementById('lecturename-student');
var studentName = document.getElementById('name-student');

var lectureObserve =  document.getElementById('lecture-observe');
var lectureNameObserve = document.getElementById('lecturename-lurker');

//When someone trys to join a group
studyGroup.addEventListener('submit', function submit(event) {
  event.preventDefault();
  window.location.replace(window.location.href + "studygroup/" + groupName.value);
});

//When someone trys to create a lecture
lectureCreate.addEventListener('submit', function submit(event) {
  event.preventDefault();
  window.location.replace(window.location.href + "lecture/" + lectureNameCreate.value + "/teacher/" + teacherName.value);
});

//When someone trys to join a lecture
lectureJoin.addEventListener('submit', function submit(event) {
  event.preventDefault();
  window.location.replace(window.location.href + "lecture/" + lectureNameJoin.value + "/student/" + studentName.value);
});

//When someone trys to observe a lecture
lectureObserve.addEventListener('submit', function submit(event) {
  event.preventDefault();
  window.location.replace(window.location.href + "lecture/" + lectureNameObserve.value + "/lurker/none");
});
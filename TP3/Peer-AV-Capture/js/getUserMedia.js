navigator.getUserMedia = navigator.getUserMedia
                            || navigator.webkitGetUserMedia
                            || navigator.mozGetUserMedia;
var constraints = {audio: false, video: true};
var video = document.querySelector("video");
function successCallback(stream) {
    window.stream = stream;
    if (window.URL) {   
        video.srcObject = stream
    }
    video.play();
}
function errorCallback(error){
    console.log("navigator.getUserMedia error: ", error);
}
navigator.mediaDevices.getUserMedia(constraints)
  .then(successCallback)
  .catch(errorCallback);
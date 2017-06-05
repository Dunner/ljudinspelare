
function MP3Recorder (config) {

  navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia ||
  navigator.mozGetUserMedia ||
  navigator.msGetUserMedia;

  var recorder = this, startTime = 0, context = new AudioContext(), audioStream;
  config = config || {};

  // Initializes LAME so that we can record.
  this.initialize = function () {
    config.sampleRate = context.sampleRate;
    MP3Encoder.init(config);
  };


  // This function finalizes LAME output and saves the MP3 data to a file.
  var microphone, processor;
  // Function that handles getting audio out of the browser's media API.
  function beginRecording(stream) {
    audioStream = stream;
    // Set up Web Audio API to process data from the media stream (microphone).
    microphone = context.createMediaStreamSource(stream);
    // Settings a bufferSize of 0 instructs the browser to choose the best bufferSize
    processor = context.createScriptProcessor(0, 1, 1);
    // Add all buffers from LAME into an array.
    processor.onaudioprocess = function (event) {
      // Send microphone data to LAME for MP3 encoding while recording.
      var array = event.inputBuffer.getChannelData(0);

      soundRecorder.visualize(array);

      //console.log('Buffer Received', array);
      MP3Encoder.encode(array);
    };
    // Begin retrieving microphone data.
    microphone.connect(processor);
    processor.connect(context.destination);
    // Return a function which will stop recording and return all MP3 data.
  }

  this.stop = function () {
    if (processor && microphone) {
      // Clean up the Web Audio API resources.
      microphone.disconnect();
      processor.disconnect();
      processor.onaudioprocess = null;
      // Return the buffers array. Note that there may be more buffers pending here.
    }
  };


  // Function for kicking off recording once the button is pressed.
  this.start = function (onSuccess, onError) {
    // Request access to the microphone.
    navigator.getUserMedia({audio: true}, function (stream) {
      // Begin recording and get a function that stops the recording.
      var stopRecording = beginRecording(stream);
      recorder.startTime = Date.now();
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess();
      }
      // Run a function every 100 ms to update the UI and dispose it after 5 seconds.
    }, function (error) {
      if (onError && typeof onError === 'function') {
        onError(error);
      }
    });
  };

  this.destroy = function() {
    this.stop();
    if (audioStream) {
      audioStream.getAudioTracks()[0].stop();
    }
    if (context && context.state !== 'closed' && context.state !== 'closing') {
      context.close();
    }
    console.log('destroy');
  }

  this.getMp3Blob = function (cb) {
    MP3Encoder.finish(function(data){
      var blob = new Blob(data, {type: 'audio/mp3'});
      var newBlobUrl = window.URL.createObjectURL(blob);
      console.log('mp3file with length:',data.length);
      cb(blob);
      // ############## DOWNLOAD
      var a = document.createElement("a");
      document.body.appendChild(a);
      a.style = "display: none";
      a.href = newBlobUrl;
      a.download = 'mp3file.mp3';
      a.click();
      // ############## DOWNLOAD

    });
    this.destroy();
  };

}
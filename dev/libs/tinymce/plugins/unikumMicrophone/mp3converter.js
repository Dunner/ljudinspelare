
/*

JH
____________________________
Converts any audiosource to mp3,
by first decoding and then making a wav,
using wavconverter.js

If can't convert - 
returns original file if under 20mb.
else error

*/

var MP3Transformer = {

  progress: 0,

  transform: function(file, cb) {
    console.log(file)
    var fileSize = Math.round( ( file.size / 1024 ) / 1024 )
    console.log('File size:', fileSize );


    var reader = new FileReader();
    var context = null;

    if (typeof AudioContext !== 'undefined') {
        context = new AudioContext();
    } else if (typeof webkitAudioContext !== 'undefined') {
        context = new webkitAudioContext();
    } else {
        usingWebAudio = false;
    }

    function tryOriginalFile(arrayBuffer) {
      console.log(file)
      if ( fileSize < 20 && (file.type).indexOf('audio') !== -1) {
      console.log(arrayBuffer)
        //File is smaller than 20mb, send
        if (typeof arrayBuffer !== 'undefined') {
          var dataView = new DataView(arrayBuffer);
          var blob = new Blob([dataView]);
          cb('done', blob);
        } else {
          cb('error');
        }
        return;
      } else {
      console.log('3')
        //File too large & can't convert, send error
        cb('cantconvert');
      }
    }

    reader.addEventListener("load", function () {
      var result = reader.result;

      context.decodeAudioData(result,
      function(decodedData) {
        var leftChannel = decodedData.getChannelData(0);
        var i=0, vol=0.1,
            sampleRate = decodedData.sampleRate,
            wav = new Wav({sampleRate: sampleRate, channels: 1}),
            buffer = new Float32Array(sampleRate);

        while(i<sampleRate){
          if( parseInt(i/100) % 2 ){
            buffer[i] = -vol;
          }
          else {
            buffer[i] = vol;
          }
          i++;
        }
        wav.setBuffer(leftChannel);

        var srclist = [];
        while( !wav.eof() ){
          srclist.push(wav.getBuffer(1000));
        }

        var b = new Blob(srclist, {type:'audio/wav'});

        cb('converting');
        if (fileSize >= 20) {cb('converting-big');}

        var converter = new MP3Converter();
        converter.convert(b,{
          bitRate: 128
        }, function(newBlob) {
          console.log(newBlob)
          cb('done', newBlob);
        });

      },
      function(error) {
        tryOriginalFile(result);
        console.log(error);
      }
      );
    },false);

    reader.addEventListener("error", function () {
      cb('error');
    });

    if (file) {
      cb('upload');
      reader.readAsArrayBuffer(file);
    }
  }

};



var MP3Converter = function (config) {
  config = config || {};
  var busy = false;
  var mp3Worker = new Worker('js/mp3worker.js');

  this.isBusy = function () {
    return busy
  };

  this.convert = function (blob) {
    var conversionId = 'conversion_' + Date.now(),
      tag = conversionId + ":";
    var opts = [];
    for(var i=1; i < arguments.length;i++){
      opts.push(arguments[i]);
    }
    console.log(tag, 'Starting conversion');
    var preferredConfig = {}, onSuccess, onProgress, onError;
    if (typeof opts[0] == 'object') {
      preferredConfig = opts.shift();
    }


    onSuccess = opts.shift();
    onProgress = opts.shift();
    onError = opts.shift();

    if (busy) {
      throw ("Another conversion is in progress");
    }

    var initialSize = blob.size,
      fileReader = new FileReader(),
      startTime = Date.now();

    fileReader.onload = function (e) {
      console.log(tag, "Passed to BG process");
      mp3Worker.postMessage({
        cmd: 'init',
        config: preferredConfig
      });
      
      mp3Worker.postMessage({cmd: 'encode', rawInput: e.target.result});
      mp3Worker.postMessage({cmd: 'finish'});

      mp3Worker.onmessage = function (e) {
        if (e.data.cmd == 'end') {
          console.log(tag, "Done converting to Mp3");
          var mp3Blob = new Blob(e.data.buf, {type: 'audio/mp3'});
          console.log(tag, "Conversion completed in: " + ((Date.now() - startTime) / 1000) + 's');
          var finalSize = mp3Blob.size;
          console.log(tag +
            "Initial size: = " + initialSize + ", " +
            "Final size = " + finalSize
            + ", Reduction: " + Number((100 * (initialSize - finalSize) / initialSize)).toPrecision(4) + "%");

          busy = false;

          if(onProgress && typeof onProgress=='function'){
            onProgress(1);
          }

          if (onSuccess && typeof onSuccess === 'function') {
            onSuccess(mp3Blob);
          }
        } else if(e.data.cmd == 'progress'){
          //post progress
          if (MP3Transformer.progress !== Math.round((e.data.progress)*100) ) {
            MP3Transformer.progress = Math.round((e.data.progress)*100);
            soundRecorder.convertProgress(MP3Transformer.progress);
          }
          if(onProgress && typeof onProgress=='function'){
            onProgress(e.data.progress);
          }
        } else if(e.data.cmd == 'error'){

        }
      };
    };
    busy = true;
    fileReader.readAsArrayBuffer(blob);
  }
}



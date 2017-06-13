
/*

TODO: Make this a serviceworker
(if browser support is good enough)
Maybe in the future // JH

____________________________
Converts any audiosource to mp3,
by first decoding and then making a wav,
using wavconverter.js

If can't convert - 
returns original file if under 20mb.
else error

*/

var MP3Converter = {

  transform: function(file, cb) {

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

    function tryOriginalFile() {
      if ( fileSize < 20 ) {
        //File is smaller than 20mb, send
        var dataView = new DataView(arrayBuffer);
        var blob = new Blob([dataView]);
        cb('done', blob);
        return;
      } else {
        //File too large & can't convert, send error
        cb('cantconvert');
      }
    }

    reader.addEventListener("load", function () {
      var result = reader.result;

      context.decodeAudioData(result,
      function(decodedData) {
        console.log(decodedData);
        var leftChannel = decodedData.getChannelData(0);
        var i=0, vol=0.1,
            sampleRate = 48000,
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
        MP3Converter.convert(b,function(newBlob) {
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
  },

  convert: function(blob, returnNewBlob){
    var fileReader = new FileReader();
    fileReader.onload = function(){
      var arrayBuffer = this.result;

      // ######### encoding wav to mp3
      var mp3Encoder, maxSamples = 1152, wav, samplesLeft, config, dataBuffer, samplesRight;
      var clearBuffer = function () {
        dataBuffer = [];
      };
      var appendToBuffer = function (mp3Buf) {
        dataBuffer.push(new Int8Array(mp3Buf));
      };
      var encode = function (arrayBuffer, callback) {
        clearBuffer();
        wav = window.lamejs.WavHeader.readHeader(new DataView(arrayBuffer));
        if (!wav) {
          console.log('error', 'msg: Specified file is not a Wave file');
          return;
        }
        var dataView = new Int16Array(arrayBuffer, wav.dataOffset, wav.dataLen / 2);
        samplesLeft = wav.channels === 1 ? dataView : new Int16Array(wav.dataLen / (2 * wav.channels));
        samplesRight = wav.channels === 2 ? new Int16Array(wav.dataLen / (2 * wav.channels)) : undefined;
        if (wav.channels > 1) {
          for (var i = 0; i < samplesLeft.length; i++) {
            samplesLeft[i] = dataView[i * 2];
            samplesRight[i] = dataView[i * 2 + 1];
          }
        }
        mp3Encoder = new window.lamejs.Mp3Encoder(wav.channels, wav.sampleRate, 96);
        var remaining = samplesLeft.length;
        for (var i = 0; remaining >= maxSamples; i += maxSamples) {
          var left = samplesLeft.subarray(i, i + maxSamples);
          var right;
          if (samplesRight) {
            right = samplesRight.subarray(i, i + maxSamples);
          }
          var mp3buf = mp3Encoder.encodeBuffer(left, right);
          appendToBuffer(mp3buf);
          remaining -= maxSamples;
          var progress = Math.round((1 - remaining / samplesLeft.length)*100);
          soundRecorder.convertProgress(progress);
        }
        if (!wav) {return;}
        var mp3buf = mp3Encoder.flush();
        appendToBuffer(mp3buf);
        callback(dataBuffer)
        // Done encoding wav to mp3
        clearBuffer(); //free up memory
      };

      encode(arrayBuffer, function(dataBuffer) {
        //Converting to Mp3
        var newBlob = new Blob(dataBuffer, {type: 'audio/mp3'});
        var newBlobUrl = window.URL.createObjectURL(newBlob);
        console.log(newBlob)

        // var a = document.createElement("a");
        // document.body.appendChild(a);
        // a.style = "display: none";
        // a.href = newBlobUrl;
        // a.download = audioPreviewObject.name+'.mp3';
        // a.click();

        returnNewBlob(newBlob);
      });



    };

    var dataURItoBlob = function(dataURI) {
      // convert base64 to raw binary data held in a string
      var byteString = atob(dataURI.split(',')[1]);

      // separate out the mime component
      var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

      // write the bytes of the string to an ArrayBuffer
      var arrayBuffer = new ArrayBuffer(byteString.length);
      var _ia = new Uint8Array(arrayBuffer);
      for (var i = 0; i < byteString.length; i++) {
        _ia[i] = byteString.charCodeAt(i);
      }

      var dataView = new DataView(arrayBuffer);
      var blob = new Blob([dataView], { type: mimeString });
      return blob;
    }

    fileReader.readAsArrayBuffer(blob);
  }

}

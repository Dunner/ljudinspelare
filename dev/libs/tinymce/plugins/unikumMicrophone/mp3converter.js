MP3Converter = function(blob, returnNewBlob) {
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
        self.postMessage({cmd: 'error', msg: 'Specified file is not a Wave file'});
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
        var progress = (1 - remaining / samplesLeft.length);
      }
      if (!wav) {return;}
      var mp3buf = mp3Encoder.flush();
      appendToBuffer(mp3buf);
      callback(dataBuffer)
      // Done encoding wav to mp3
      clearBuffer(); //free up memory
    };
    // ######### stop encoding wav to mp3

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

  fileReader.readAsArrayBuffer(blob);

}
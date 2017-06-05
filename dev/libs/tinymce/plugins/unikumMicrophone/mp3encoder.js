/*

TODO: Make this a serviceworker 
(if browser support is good enough)
Maybe in the future // JH

____________________________
Realtime encoder of mp3 blobs

*/


MP3Encoder = {};
MP3Encoder.mp3Encoder;
MP3Encoder.maxSamples = 1152;
MP3Encoder.samplesMono;
MP3Encoder.config;
MP3Encoder.dataBuffer;

MP3Encoder.clearBuffer = function () {
  MP3Encoder.dataBuffer = [];
};

MP3Encoder.appendToBuffer = function (mp3Buf) {
  MP3Encoder.dataBuffer.push(new Int8Array(mp3Buf));
};


MP3Encoder.init = function (prefConfig) {
  MP3Encoder.config = prefConfig || {debug: true};
  MP3Encoder.mp3Encoder = new window.lamejs.Mp3Encoder(1, MP3Encoder.config.sampleRate || 44100, MP3Encoder.config.bitRate || 123);
  MP3Encoder.clearBuffer();
};

MP3Encoder.floatTo16BitPCM = function floatTo16BitPCM(input, output) {
  //var offset = 0;
  for (var i = 0; i < input.length; i++) {
    var s = Math.max(-1, Math.min(1, input[i]));
    output[i] = (s < 0 ? s * 0x8000 : s * 0x7FFF);
  }
};

MP3Encoder.convertBuffer = function(arrayBuffer){
  var data = new Float32Array(arrayBuffer);
  var out = new Int16Array(arrayBuffer.length);
  MP3Encoder.floatTo16BitPCM(data, out)
  return out;
};

MP3Encoder.encode = function (arrayBuffer) {
  MP3Encoder.samplesMono = MP3Encoder.convertBuffer(arrayBuffer);
  var remaining = MP3Encoder.samplesMono.length;
  for (var i = 0; remaining >= 0; i += MP3Encoder.maxSamples) {
    var left = MP3Encoder.samplesMono.subarray(i, i + MP3Encoder.maxSamples);
    var mp3buf = MP3Encoder.mp3Encoder.encodeBuffer(left);
    MP3Encoder.appendToBuffer(mp3buf);
    remaining -= MP3Encoder.maxSamples;
  }
};

MP3Encoder.finish = function (cb) {
  MP3Encoder.appendToBuffer(MP3Encoder.mp3Encoder.flush());
  cb(MP3Encoder.dataBuffer);
  MP3Encoder.clearBuffer(); //free up memory
};
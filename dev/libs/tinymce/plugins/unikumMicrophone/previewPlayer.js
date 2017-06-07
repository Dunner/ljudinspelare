
/**
 * Handles the audiopreview, its blobs and playback
 */
 PreviewPlayer = {
   init: function(element) {
     this.element = element;
     this.reset();
     $(this.element).find('.uap_playstatus_btn_wrapper').on('click', function() {
        PreviewPlayer.audio.onended = function(e){
          PreviewPlayer.stopPlaying();
        };
        if (!PreviewPlayer.audio.paused) {
          PreviewPlayer.stopPlaying();
        } else {
          PreviewPlayer.startPlaying();
        }
     });
   },

   reset: function() {
     this.blob = undefined;
     this.blobUrl = undefined;
     this.name = 'Ljudklipp';
     this.audio = undefined;
     this.tickInterval = undefined;
     this.setName(this.name);
   },

   giveName: function() {
     this.name = $('.uap_stage2_record_nameinput').val();
     this.setName(this.name);
   },

   setName: function(name) {
     this.name = name;
     $('.uap_stage2_record_nameinput').val(this.name);
   },

   setBlob: function(blob) {
     this.reset();
     this.blob = blob;
     this.blobUrl = (window.URL || window.webkitURL).createObjectURL(this.blob);
     this.audio = new Audio(this.blobUrl);
   },

   setBlobUrl: function(url) {
     this.reset();
     this.blobUrl = url;
     this.audio = new Audio(this.blobUrl);
   },

   startTick: function() {
     if (!this.audio.paused) {
       this.tickInterval = setInterval(this.tick.bind(this),1000);
     }
   },

   updateTimeAndProgress: function(timeInSeconds) {
     var progressInPercent = Math.round((timeInSeconds/this.audio.duration)*100);
    //  if (timeInSeconds < 1) {timeInSeconds = ''};
     $(this.element).find('.uap_track_progress').css('width', progressInPercent+'%');
     $(this.element).find('.uap_track_time').html(soundRecorder.secondsToMinutes(timeInSeconds));
     $(this.element).find('.uap_track_duration').html(soundRecorder.secondsToMinutes(Math.round(this.audio.duration)));
   },

   tick: function() {
     if (this.audio) {
       if (this.audio.currentTime > 0 && !this.audio.paused) {
         var playedTimeInSeconds = Math.round(PreviewPlayer.audio.currentTime);
         this.updateTimeAndProgress(playedTimeInSeconds);
       } else {
         this.stopPlaying();
       }
     }
   },

   endTick: function() {
     clearInterval(this.tickInterval);
   },

   startPlaying: function() {
     this.updateTimeAndProgress(0);
     PreviewPlayer.audio.play();
     this.startTick();
     $(this.element).addClass('unikum_audioplayer__isPlaying');
   },

   stopPlaying: function() {
     this.updateTimeAndProgress(0);
     $(this.element).removeClass('unikum_audioplayer__isPlaying');
     PreviewPlayer.audio.pause();
     this.endTick();
   },

   saveAudioFile:function () {
     var a = document.createElement("a");
     document.body.appendChild(a);
     a.style = "display: none";
     a.href = this.blobUrl;
     a.download = this.name;
     a.click();
   }
 }

$( document ).ready(function() { 

  tinymce.init({
    selector: 'textarea',
    height: 500,
    menubar: false,
    plugins: [
      'advlist autolink lists link image charmap print preview anchor',
      'searchreplace visualblocks code fullscreen',
      'insertdatetime media table contextmenu paste code',
      'unikumMicrophone',
      'noneditable'
    ],
    toolbar: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | unikumMicrophone',
    content_css: ['//www.tinymce.com/css/codepen.min.css', '../css/tinymce-audioplayer.css'],
    setup: function(editor) {
      editor.on('NodeChange', function(e){
        $('#preview').html(editor.getContent());
        Transformer.init();
      });
    }
  });



  var AudioPlayer = {};
  AudioPlayer.init = function(element) {
    this.element = element;
    var tempThis = this;
    $(this.element)
     .find('.uap_playstatus_btn_wrapper')
     .on('click', function() {
      tempThis.audio.onended = function(e){
        tempThis.stopPlaying();
      };
      if (!tempThis.audio.paused) {
        tempThis.stopPlaying();
      } else {
        tempThis.startPlaying();
      }
    });
  };

  AudioPlayer.reset = function() {
    this.blob = undefined;
    this.blobUrl = undefined;
    this.name = 'Ljudfil';
    this.audio = undefined;
    this.tickInterval = undefined;
  };

  AudioPlayer.create = function(element) {
    var audioPlayer = Object.create(AudioPlayer);
    audioPlayer.init(element);
    audioPlayer.audio = new Audio($(element).attr('data-url'));
    console.log('Created AudioPlayer ' + audioPlayer);
    return audioPlayer;
  };

  AudioPlayer.startTick = function() {
    if (!this.audio.paused) {
      this.tickInterval = setInterval(this.tick.bind(this),1000);
    }
  };

  AudioPlayer.updateTimeAndProgress = function(timeInSeconds) {
    var progressInPercent = Math.round((timeInSeconds/this.audio.duration)*100);
    //  if (timeInSeconds < 1) {timeInSeconds = ''};
    $(this.element).find('.uap_track_progress').css('width', progressInPercent+'%');
    $(this.element).find('.uap_track_time').html(this.secondsToMinutes(timeInSeconds));
    $(this.element).find('.uap_track_duration').html(this.secondsToMinutes(Math.round(this.audio.duration)));
  };

  AudioPlayer.tick = function() {
    if (this.audio) {
      if (this.audio.currentTime > 0 && !this.audio.paused) {
        var playedTimeInSeconds = Math.round(this.audio.currentTime);
        this.updateTimeAndProgress(playedTimeInSeconds);
      } else {
        this.stopPlaying();
      }
    }
  };

  AudioPlayer.endTick = function() {
    clearInterval(this.tickInterval);
  };

  AudioPlayer.startPlaying = function() {
    this.updateTimeAndProgress(0);
    this.audio.play();
    this.startTick();
    $(this.element).addClass('unikum_audioplayer__isPlaying');
  };

  AudioPlayer.stopPlaying = function() {
    this.updateTimeAndProgress(0);
    $(this.element).removeClass('unikum_audioplayer__isPlaying');
    this.audio.pause();
    this.endTick();
  };

  AudioPlayer.prettyTimeString = function(num) {
    return ( num < 10 ? "0" : "" ) + num;
  };

  AudioPlayer.secondsToMinutes = function(seconds) {
    var minutes = Math.floor(seconds / 60);
    seconds = Math.floor(seconds % 60);
    minutes = this.prettyTimeString(minutes);
    seconds = this.prettyTimeString(seconds);
    return minutes + ":" + seconds;
  };


  /**
   ** Transformer - Audio Player, audioplayer
   ** Scrapes the page for audio elements '.unikum_audio' and
   ** transforms them into audioplayers
   **/
  var Transformer = {};

  Transformer.untransformedAudioElements = [];
  Transformer.transformedAudioElements = [];
  Transformer.tagToReplace = '.unikum_audio';


  Transformer.init = function(contextDocument) {
    this.contextDocument = document;
    if (contextDocument) {
      //Pass in a context to transform in a sub document(i.e. iframe)
      this.contextDocument = contextDocument;
    }
    this.findAndReplace();
  };

  Transformer.findAndReplace = function() {
    this.findAudioElements();
    this.replaceAudioElements();
  }

  Transformer.findAudioElements = function() {
    this.untransformedAudioElements = $(this.contextDocument).find(this.tagToReplace).toArray();
    return this.untransformedAudioElements;
  };

  Transformer.replaceAudioElements = function() {
    console.log(this.untransformedAudioElements.length, 'Audioplayers found');
    if (this.untransformedAudioElements.length > 0) {
      this.untransformedAudioElements.forEach(function(element){
        Transformer.replaceAudioElement(element)
      });
    }
  };

  Transformer.replaceAudioElement = function(element) {
    var name = $(element).attr('data-name');
    var url = $(element).attr('data-url');
    var newElement = $('<div/>', {
      class: 'unikum_audioplayer',
      html: Transformer.getTemplate(name)
    }).attr({
      'data-url': url,
      'name': name
    });
    $(element).replaceWith($(newElement));
    AudioPlayer.create(newElement);
  };

  Transformer.getTemplate = function(name) {return `
    <div class="uap_top_wrapper">
      <div class="uap_playstatus_btn_wrapper">
        <div class="uap_btn_round">
          <div class="glyphicon glyphicon-play"></div>
          <div class="glyphicon glyphicon-pause"></div>
        </div>
      </div>
      <div class="uap_txtinfo">
        ${name}
      </div>
    </div>
    <div class="uap_bottom_wrapper">
      <div class="uap_track_progress"></div>
      <span class="uap_track_time"></span>
      <span class="uap_track_duration"></span>
    </div>
  `};

  Transformer.init();

}); 

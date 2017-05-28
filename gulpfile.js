'use strict'; 
  //## 
  var gulp = require('gulp'); 
  var prefix = require('gulp-autoprefixer'); 
  var jshint = require('gulp-jshint'); 
  var stylish = require('jshint-stylish'); 
  var browserSync = require('browser-sync').create(); 
  var stylus = require('gulp-stylus'); 
  var sourcemaps = require('gulp-sourcemaps'); 
  var reload = browserSync.reload; 
  var nib = require('nib'); 
  //## 
  // Confingure our directories 
  var paths = { 
    js:     'dev/js/**/*.js', 
    css:    'dev/css', 
    styles: 'dev/styles', 
    img:    'dev/images', 
  }; 
  //## 
  // Begin Script Tasks 
  //## 
  gulp.task('lint', function () { 
    return gulp.src([ 
        paths.js 
      ]) 
      .pipe(jshint()) 
      .pipe(jshint.reporter(stylish)) 
  }); 
  //## 
  // Stylus Tasks 
  //## 
  gulp.task('styles', function () { 
    gulp.src(paths.styles + '/*.styl') 
      .pipe(sourcemaps.init()) 
      .pipe(stylus({ 
        paths:  ['node_modules'], 
        import: ['stylus-type-utils', 'nib'], 
        use: [nib()], 
        'include css': true 
      })) 
      .on('error', function(err){console.log(err.toString());this.emit('end');}) 
      .pipe(sourcemaps.write('.')) 
      .pipe(gulp.dest(paths.css)) 
      .pipe(browserSync.stream()); 
  }); 
  //## 
  // Autoprefixer Tasks 
  //## 
  gulp.task('prefix', function () { 
    gulp.src(paths.css + '/*.css') 
      .pipe(prefix(["last 8 version", "> 1%", "ie 8"])) 
      .pipe(gulp.dest(paths.css)); 
  }); 
  //## 
  // Watch 
  //## 
  gulp.task('watch', function () { 
    gulp.watch(paths.js, ['lint']); 
    gulp.watch(paths.styles + '/**/*.styl', ['styles']); 
    gulp.watch('dev/**/*.html').on('change', reload); 
  }); 
  //## 
  // BrowserSync Task 
  //## 
  gulp.task('browserSyncStatic', function () { 
    browserSync.init({ 
      server: { 
        baseDir: "./dev/" 
      } 
    }); 
  }); 
  //## 
  gulp.task('browserSyncProxy', function () { 
    browserSync.init({ 
      proxy: 'yourlocal.dev' 
    }); 
  }); 
  //## 
  // Server Tasks 
  //## 
  gulp.task('default', ['styles', 'lint', 'watch', 'prefix']); 
  gulp.task('serve', ['styles', 'lint', 'watch', 'prefix', 'browserSyncStatic']) 

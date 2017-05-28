@echo off
REM ===============================================================
REM  
REM  
REM ===============================================================
CD %CD%
SET mypath=%~dp0
echo %mypath:~0,-1%
FOR %%a in (.) do SET currentfolder=%%~na
REM ===============================================================
echo ===============================================================
echo Hi, drop me in any folder and launch me to create a new project
echo ===============================================================
IF EXIST %mypath%package.json (
	goto Exists
) else (
	goto Ask
)

:Ask
SET INPUT=
SET /P INPUT=Create project in this folder(%currentfolder%) (y/n)? 
IF /I "%INPUT%"=="y" goto Create 
IF /I "%INPUT%"=="n" goto END
echo What do you mean "%INPUT%"? answer with y or n, short for yes or no
goto Ask


:Create
echo ===============================================================
echo Initializing project: %currentfolder%
REM ===============================================================
REM Create package.json
REM ===============================================================
echo {"name": "%currentfolder%", "version": "1.0.0", "description": "Simple & Sweet", "repository": "none", "license": "MIT"} > package.json
md dev
md dist
md libs
REM ===============================================================
REM Create HTML
REM ===============================================================

echo ^<!doctype html^> >dev/index.html
echo ^<html class="no-js"^> >>dev/index.html
echo   ^<head^> >>dev/index.html
echo     ^<meta charset="utf-8"^> >>dev/index.html
echo     ^<title^> ^</title^> >>dev/index.html
echo     ^<meta name="description" content=""^> >>dev/index.html
echo     ^<meta name="viewport" content="width=device-width"^> >>dev/index.html
echo     ^<link rel="stylesheet" href="css/reset.css"^> >>dev/index.html
echo     ^<link rel="stylesheet" href="css/style.css"^> >>dev/index.html
echo   ^</head^> >>dev/index.html
echo   ^<body^> >>dev/index.html
echo     ^<h1^>Hello World!^</h1^> >>dev/index.html
echo 		 ^<script src="https://code.jquery.com/jquery-3.1.1.slim.min.js" integrity="sha256-/SIrNqv8h6QGKDuNoLGA4iret+kyesCkHGzVUUV0shc=" crossorigin="anonymous"^>^</script^> >>dev/index.html
echo 		 ^<script src="js/main.js"^>^</script^> >>dev/index.html
echo   ^</body^> >>dev/index.html
echo ^</html^> >>dev/index.html

REM ===============================================================
REM Create STYLES
REM ===============================================================
md dev\styles
md dev\css

echo body >dev/styles/style.styl
echo   background #efefef >>dev/styles/style.styl

echo body{background: #efefef}> dev/css/style.css
echo html,body,div,span,applet,object,iframe,h1,h2,h3,h4,h5,h6,p,blockquote,pre,a,abbr,acronym,address,big,cite,code,del,dfn,em,img,ins,kbd,q,s,samp,small,strike,strong,sub,sup,tt,var,b,u,i,center,dl,dt,dd,ol,ul,li,fieldSET,form,label,legend,table,caption,tbody,tfoot,thead,tr,th,td,article,aside,canvas,details,embed,figure,figcaption,footer,header,hgroup,menu,nav,output,ruby,section,summary,time,mark,audio,video{border:0;font-size:100%%;font:inherit;vertical-align:baseline;margin:0;padding:0}article,aside,details,figcaption,figure,footer,header,hgroup,menu,nav,section{display:block}body{line-height:1}ol,ul{list-style:none}blockquote,q{quotes:none}blockquote:before,blockquote:after,q:before,q:after{content:none}table{border-collapse:collapse;border-spacing:0} > dev/css/reset.css

REM ===============================================================
REM Create SCRIPTS && IMAGES
REM ===============================================================
md dev\js

echo $( document ).ready(function() { >dev/js/main.js
echo   console.log( "ready!" ); >>dev/js/main.js
echo }); >>dev/js/main.js

md dev\images

REM ===============================================================
REM Create Gulpfile
REM ===============================================================

echo 'use strict'; >gulpfile.js
echo   //## >>gulpfile.js
echo   var gulp = require('gulp'); >>gulpfile.js
echo   var prefix = require('gulp-autoprefixer'); >>gulpfile.js
echo   var jshint = require('gulp-jshint'); >>gulpfile.js
echo   var stylish = require('jshint-stylish'); >>gulpfile.js
echo   var browserSync = require('browser-sync').create(); >>gulpfile.js
echo   var stylus = require('gulp-stylus'); >>gulpfile.js
echo   var sourcemaps = require('gulp-sourcemaps'); >>gulpfile.js
echo   var reload = browserSync.reload; >>gulpfile.js
echo   var nib = require('nib'); >>gulpfile.js
echo   //## >>gulpfile.js
echo   // Confingure our directories >>gulpfile.js
echo   var paths = { >>gulpfile.js
echo     js:     'dev/js/**/*.js', >>gulpfile.js
echo     css:    'dev/css', >>gulpfile.js
echo     styles: 'dev/styles', >>gulpfile.js
echo     img:    'dev/images', >>gulpfile.js
echo   }; >>gulpfile.js
echo   //## >>gulpfile.js
echo   // Begin Script Tasks >>gulpfile.js
echo   //## >>gulpfile.js
echo   gulp.task('lint', function () { >>gulpfile.js
echo     return gulp.src([ >>gulpfile.js
echo         paths.js >>gulpfile.js
echo       ]) >>gulpfile.js
echo       .pipe(jshint()) >>gulpfile.js
echo       .pipe(jshint.reporter(stylish)) >>gulpfile.js
echo   }); >>gulpfile.js
echo   //## >>gulpfile.js
echo   // Stylus Tasks >>gulpfile.js
echo   //## >>gulpfile.js
echo   gulp.task('styles', function () { >>gulpfile.js
echo     gulp.src(paths.styles + '/*.styl') >>gulpfile.js
echo       .pipe(sourcemaps.init()) >>gulpfile.js
echo       .pipe(stylus({ >>gulpfile.js
echo         paths:  ['node_modules'], >>gulpfile.js
echo         import: ['stylus-type-utils', 'nib'], >>gulpfile.js
echo         use: [nib()], >>gulpfile.js
echo         'include css': true >>gulpfile.js
echo       })) >>gulpfile.js
echo       .on('error', function(err){console.log(err.toString());this.emit('end');}) >>gulpfile.js
echo       .pipe(sourcemaps.write('.')) >>gulpfile.js
echo       .pipe(gulp.dest(paths.css)) >>gulpfile.js
echo       .pipe(browserSync.stream()); >>gulpfile.js
echo   }); >>gulpfile.js
echo   //## >>gulpfile.js
echo   // Autoprefixer Tasks >>gulpfile.js
echo   //## >>gulpfile.js
echo   gulp.task('prefix', function () { >>gulpfile.js
echo     gulp.src(paths.css + '/*.css') >>gulpfile.js
echo       .pipe(prefix(["last 8 version", "> 1%%", "ie 8"])) >>gulpfile.js
echo       .pipe(gulp.dest(paths.css)); >>gulpfile.js
echo   }); >>gulpfile.js
echo   //## >>gulpfile.js
echo   // Watch >>gulpfile.js
echo   //## >>gulpfile.js
echo   gulp.task('watch', function () { >>gulpfile.js
echo     gulp.watch(paths.js, ['lint']); >>gulpfile.js
echo     gulp.watch(paths.styles + '/**/*.styl', ['styles']); >>gulpfile.js
echo     gulp.watch('dev/**/*.html').on('change', reload); >>gulpfile.js
echo   }); >>gulpfile.js
echo   //## >>gulpfile.js
echo   // BrowserSync Task >>gulpfile.js
echo   //## >>gulpfile.js
echo   gulp.task('browserSyncStatic', function () { >>gulpfile.js
echo     browserSync.init({ >>gulpfile.js
echo       server: { >>gulpfile.js
echo         baseDir: "./dev/" >>gulpfile.js
echo       } >>gulpfile.js
echo     }); >>gulpfile.js
echo   }); >>gulpfile.js
echo   //## >>gulpfile.js
echo   gulp.task('browserSyncProxy', function () { >>gulpfile.js
echo     browserSync.init({ >>gulpfile.js
echo       proxy: 'yourlocal.dev' >>gulpfile.js
echo     }); >>gulpfile.js
echo   }); >>gulpfile.js
echo   //## >>gulpfile.js
echo   // Server Tasks >>gulpfile.js
echo   //## >>gulpfile.js
echo   gulp.task('default', ['styles', 'lint', 'watch', 'prefix']); >>gulpfile.js
echo   gulp.task('serve', ['styles', 'lint', 'watch', 'prefix', 'browserSyncStatic']) >>gulpfile.js

echo ===============================================================
echo Installing dependencies
echo ===============================================================

call npm install gulp --save-dev
call npm install gulp-autoprefixer --save-dev
call npm install gulp-sourcemaps --save-dev

call npm install jshint --save-dev
call npm install jshint-stylish --save-dev
call npm install gulp-jshint --save-dev

call npm install stylus --save
call npm install stylus-type-utils --save
call npm install gulp-stylus --save-dev
call npm install nib --save-dev

call npm install browser-sync --save-dev

echo ===                                                         ===
echo ======                                                   ======
echo ===============================================================
echo Finished, have fun!
REM pause
goto Exists

:Exists
echo ===============================================================
echo Project exists, spinning-up
echo ===============================================================
goto Serve

:Serve
cmd.exe /k "gulp serve"

:END
cmd.exe
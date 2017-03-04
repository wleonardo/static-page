const CWD = process.cwd(); // "/Users/a888/Desktop/AOB"
const gulp = require('gulp');

const clean = require('gulp-clean');
const runSequence = require('run-sequence');

const swig = require('gulp-swig');
//Prettify JavaScript, JSON, HTML and CSS.
const prettify = require('gulp-jsbeautifier');

const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');

const browserify = require('gulp-browserify');
const uglify = require('gulp-uglify');

const browserSync = require('browser-sync').create();

var reload = browserSync.reload;

var browsers = [
  "> 1%",
  "last 2 versions",
  "ie 9-11"
];

gulp.task('clean', function() {
  return gulp.src('./dist', { read: false })
    .pipe(clean());
});

// 静态服务器
gulp.task('browser-sync', function() {
  browserSync.init({
    port: 8888,
    startPath: "page/index.html",
    server: {
      baseDir: "./dist"
    }
  });
});

gulp.task('reload', function() {
  reload();
});

gulp.task('html', function() {
  gulp.src('./app/page/**/*.html')
    .pipe(swig({ defaults: { cache: false } }))
    .pipe(prettify())
    .pipe(gulp.dest('./dist/page'));
});

gulp.task('css', function() {
  return gulp.src(['./app/style/**/*.scss', './app/base/**/*.scss'])
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(autoprefixer({
      "browsers": browsers
    }))
    .pipe(gulp.dest('./dist/style/'));
});

gulp.task('js', function() {
  gulp.src(['./app/js/**/*.js'])
    .pipe(browserify({}))
    .on('error', function(err) {
      console.log('Less Error!', err.message);
      this.end();
    })
    .pipe(prettify())
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('uglifyJs', function() {
  gulp.src(['./app/base/**/*.js'])
    .pipe(browserify({}))
    .on('error', function(err) {
      console.log('Less Error!', err.message);
      this.end();
    })
    .pipe(uglify())
    .pipe(gulp.dest('./dist/js'));
});

gulp.task('copy-lib', function() {
  return gulp.src('./app/lib/**')
    .pipe(gulp.dest('./dist/lib'));
});

gulp.task('compile', function(callback) {
  runSequence('clean', ['copy-lib', 'html', 'js', 'css', 'uglifyJs'],
    callback);
});

var watchTaskAndReload = function(watchTask) {
  watchTask.forEach(function(taskInfo) {
    taskInfo.task = taskInfo.task.concat(['reload']);
    gulp.watch(taskInfo.watchFile, taskInfo.task);
  });
};

gulp.task('default', ['compile', 'browser-sync'], function() {
  // 监控内容
  watchTaskAndReload([{
    name: 'css',
    watchFile: ['app/style/**/*.scss', 'app/base/**/*.scss'],
    task: ['css']
  }, {
    name: 'html',
    watchFile: ['app/base/**/*.html', 'app/page/**/*.html', 'app/component/**/*.html'],
    task: ['html']
  }, {
    name: 'js',
    watchFile: ['app/js/**/*.js'],
    task: ['js']
  }, {
    name: 'uglifyJs',
    watchFile: ['app/base/**/*.js'],
    task: ['uglifyJs']
  }, {
    name: 'copy-lib',
    watchFile: ['app/lib/**'],
    task: ['copy-lib']
  }]);
});

var gp = require("gulp");
var concat = require("gulp-concat");
var clean = require("gulp-clean");
var sass = require('gulp-sass');
var uglify = require('gulp-uglify');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('gulp-cssnano');

gp.task('clean', function () {
  return gp.src('./dist/', {
    read: false
  }).pipe(clean())
})

gp.task('sass', ['clean'], function () {
  return gp.src(['src/assets/sass/*.scss', 'src/assets/sass/**/*.scss'])
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('appkit.css'))
    .pipe(postcss([autoprefixer()]))
    .pipe(cssnano({
      reduceIdents: {
        keyframes: false
      },
      discardUnused: {
        keyframes: false
      }
    }))
    .pipe(gp.dest('./dist/css/'))
})

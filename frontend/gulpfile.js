/*eslint-env node */

var gulp = require('gulp');
var sass = require('gulp-sass');
// var autoprefixer = require('gulp-autoprefixer');
// var browserSync = require('browser-sync').create();
var eslint = require('gulp-eslint');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify-es').default;
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant');

gulp.task('default', ['copy-html', 'styles', 'scripts', 'service-worker'], () => {
    gulp.watch('css/**/*.css', ['styles']);
    gulp.watch('js/**/*.js', ['lint', 'scripts']);
    gulp.watch('./**.html', ['copy-html']);
    gulp.watch('./sw.js', ['service-worker']);
});

gulp.task('--prod', ['copy-html', 'styles', 'scripts-dist']);

gulp.task('scripts', () => {
    gulp.src('js/**/*.js')
        .pipe(babel())
        //.pipe(concat('scripts.js'))
        .pipe(gulp.dest('dist/js'));
});

gulp.task('scripts-dist', () => {
    gulp.src('js/**/*.js')
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(babel())
        // .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/js'));

});

gulp.task('service-worker', () => {
    gulp.src('./sw.js')
        .pipe(gulp.dest('./dist'));

    gulp.src('./manifest.json')
        .pipe(gulp.dest('./dist'));
});

gulp.task('copy-html', () => {
    gulp.src('./**.html')
        .pipe(gulp.dest('./dist'));
});

gulp.task('styles', () => {
    gulp.src('./css/**/*.css')
        // .pipe(autoprefixer({
        //     browsers: ['last 2 versions']
        // }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('dist/css'))
});
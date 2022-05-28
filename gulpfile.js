const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const babel = require('gulp-babel');
const { parallel, series } = require('gulp');
const webserver = require('gulp-webserver');

function bundle() {
	return browserify("./src/html-logger.bundle.js")
		.transform("babelify", { presets: ['es2015'] })
		.bundle()
		.pipe(source("html-logger.bundle.js"))
		.pipe(gulp.dest('dist'));
};

function build() {
	return gulp.src("src/html-logger.js")
		.pipe(babel({ presets: ['@babel/env'] }))
		.pipe(gulp.dest("dist"))
}

function develop() {
	gulp.watch(['src/*.js'], {delay:200}, parallel('default'));
}

function serve() {
	return gulp.src('/')
		  .pipe(webserver({
			livereload: false,
			directoryListing: false,
			open: true,
			fallback: '/demo/demo.html'
		  }));
}

gulp.task('default', series(build, bundle));

exports.build = build;
exports.bundle = bundle;
exports.develop = develop;
exports.serve = serve;
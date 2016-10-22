const gulp = require('gulp')
const browserify = require('browserify')
const source = require('vinyl-source-stream')
const babel = require('gulp-babel')

gulp.task('bundle', () => {
	return browserify("./src/html-logger.bundle.js")
        .transform("babelify", {presets: ["es2015"]})
        .bundle()
        .pipe(source("html-logger.bundle.js"))
        .pipe(gulp.dest('dist'));
})

gulp.task('build', () => {
		return gulp.src("src/html-logger.js")
		.pipe(babel({ presets: ["es2015"]}))
		.pipe(gulp.dest("dist"))
})

gulp.task('default', ['build', 'bundle'])
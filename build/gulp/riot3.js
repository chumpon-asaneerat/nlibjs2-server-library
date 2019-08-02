const GulpTask = require('./gulp-task').GulpTask;

const gulp = require('gulp');
const riot = require('gulp-riot');

const concat = require('gulp-concat');
const uglify = require('gulp-uglify-es').default;

class GulpRiot3 extends GulpTask {
    task() {
        if (this.opts.merge) {
            return gulp.src(this.opts.src)
                .pipe(riot({ compact: true }))
                .pipe(concat(this.opts.bundle))
                .pipe(uglify())
                .pipe(gulp.dest(this.opts.dest));
        }
        else {
            return gulp.src(this.opts.src)
                .pipe(riot({ compact: true }))
                .pipe(gulp.dest(this.opts.dest));
        }
    };
};

exports.GulpRiot3 = module.exports.GulpRiot3 = GulpRiot3;
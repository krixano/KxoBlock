//var fs = require("fs");
var vueify = require("vueify");

var gulp = require("gulp");
var browserify = require("browserify");
var source = require("vinyl-source-stream");
var uglifyify = require("uglifyify");
// var gutil = require("gulp-util"); // deprecated
var sourcemaps = require("gulp-sourcemaps");
var buffer = require("vinyl-buffer");
var prefix = require("gulp-autoprefixer");

var sass = require("gulp-sass");
let cleanCSS = require('gulp-clean-css');
// var concat = require("gulp-concat");

var babelify = require("babelify");

var paths = {
    pages: ["src/**/*.html"],
    styles: ["src/sass/**/*.sass"],
    scripts: ["src/**/*.js"]
};

gulp.task("html", function() {
    return gulp.src(paths.pages)
        .pipe(gulp.dest("."));
});

gulp.task("styles", function() {
    return gulp.src(paths.styles)
        .pipe(sass({
            "includePaths": [
                "./node_modules"
            ]
        }).on("error", sass.logError))
        .pipe(prefix({cascade: true}))
        .pipe(cleanCSS({compatibility: 'ie8'}))
        .pipe(gulp.dest("./css/"));
});

gulp.task("scripts", function() {
    return browserify({
        basedir: ".",
        debug: true,
        entries: ["src/main.js"],
        cache: {},
        packageCache: {},
        insertGlobals: true,
        //fullPaths: true
    })
    .transform(vueify)
    .transform(babelify, {
        presets: [
            ["@babel/preset-env"]
        ]
    })
    .transform('uglifyify', { global: true })
    .bundle()
    .on("error", function (err) { console.error(err); this.emit("end"); })
    .pipe(source("all.js"))
    .pipe(buffer())
    .pipe(sourcemaps.init({ loadMaps: true }))
    .pipe(sourcemaps.write("./"))
    .pipe(gulp.dest("./js/"));
});

gulp.task("watch", function() {
    gulp.watch(paths.scripts, ["scripts"]);
    gulp.watch(paths.styles, ["styles"]);
    gulp.watch(paths.pages, ["html"]);
});

gulp.task("default", gulp.parallel("scripts", "styles", "html"));

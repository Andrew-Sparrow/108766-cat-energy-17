"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemap = require("gulp-sourcemaps");
var rename = require("gulp-rename");
var server = require("browser-sync").create();
var less = require("gulp-less");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var csso = require("gulp-csso");
var imagemin =require("gulp-imagemin");
var webp =require("gulp-webp");
var svgdtore = require("gulp-svgstore");
var posthtml = require("gulp-posthtml");
var del = require("del");
var include = require("posthtml-include");


gulp.task("clean", function () {
  return del("build");
});

gulp.task("webp", function (){
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"))
});

gulp.task("images", function() {
  return gulp.src("source/img/**/*.{png, jpg, svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo()
    ]))
    .pipe(gulp.dest("source/img"));
});

gulp.task("css", function () {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"));
});

gulp.task ("sprite", function () {
  return gulp.src([
    "source/img/icon-insta.svg",
    "source/img/icon-vk.svg",
    "source/img/icon-fb.svg",
    "source/img/htmlacademy-svg.svg",
    "source/img/icon-phone.svg",
    "source/img/icon-mail.svg",
  ])
  .pipe(svgstore({
    inlineSvg: true
  }))
  .pipe(rename("sprite.svg"))
  .pipe(gulp.dest("build/img"))
});

/*adds sprite to html*/
gulp.task("html", function(){
  return gulp.src("source/*.html")
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest("build"));
});

gulp.task("server", function () {
  server.init({
    server: "build/"
  });

  gulp.watch("source/less/**/*.less",gulp.series("css"));
  gulp.watch([
    "source/img/icon-insta.svg",
    "source/img/icon-vk.svg",
    "source/img/icon-fb.svg",
    "source/img/htmlacademy-svg.svg",
    "source/img/icon-phone.svg",
    "source/img/icon-mail.svg",
  ], gulp.series("sprite", "html", "refresh"));
  gulp.watch("source/*.html", gulp.series("html","refresh"));
// watches if new images were added or deleted from source/img
  gulp.watch("source/img/**",gulp.series("build"))
});

gulp.task("refresh", function (done) {
  server.reload();
  done();
});

gulp.task("copy", function() {
  return gulp.src([
    "source/fonts/**/*.{woff, woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.ico"
  ],{
    base: "source"
  })
    .pipe(gulp.dest("build"));
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("build", gulp.series(
  "clean",
  "copy",
  "css",
  "sprite",
  "html",
  "refresh"
));

gulp.task("start", gulp.series("build", "server"));

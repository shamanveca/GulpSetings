const gulp = require('gulp');
const less = require('gulp-less'); // Преобразует less в css
const del = require('del'); // Удаляет файлы
const rename = require('gulp-rename');
const cleanCSS = require('gulp-clean-css'); // Минифицирует CSS

// Используется для преодбразования js 
// в универсальный js для старых версий браузеров
const babel = require('gulp-babel');

const uglify = require('gulp-uglify'); // Минифицирует JS
const concat = require('gulp-concat'); // Для объединения нескольких файлов в один
const sourcemaps = require('gulp-sourcemaps'); // Для отоброжения исходного файла в DevTools

const PostCSS = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const htmlmin = require('gulp-htmlmin');
const browsersync = require('browser-sync').create();

const copy = require('gulp-copy');  // Копирование элементов

// Пути к файлам откуда и куда
const paths = {
    html: {
        src: './*.html',
        dest: './done'
    },

    styles: {
        src: './less/**/*.less',
        dest: './done/css-min'
    },

    scripts: {
        src: './js/**/*.js',
        dest: './done/js-min'
    },

    images: {
        src: './img/**/*.*',
        dest: './done/'
    }
}

function imgcopy() {
    return gulp.src(paths.images.src)
    .pipe(copy(paths.images.dest))

    .pipe(gulp.dest(paths.images.dest))
}

function clean() {
    return del(['done'])
}

function html() {
    return gulp.src(paths.html.src)
    .pipe(htmlmin({ collapseWhitespace: true }))
    .pipe(rename({             // переименовывает файл и добавляет ему суффикс
        basename: 'index',
        suffix: '.min'
     }))

    .pipe(gulp.dest(paths.html.dest))
    .pipe(browsersync.stream())
}

// Функция для преобразования less в css
function styles() {
    return gulp.src(paths.styles.src)
     .pipe(sourcemaps.init())
     .pipe(less())
     .pipe(PostCSS([
        autoprefixer()
     ]))
     .pipe(cleanCSS({
        level: 2
     }))                        // Оптимизирует и минифицирует код
     .pipe(rename({             // переименовывает файл и добавляет ему суффикс
        basename: 'style',
        suffix: '.min'
     }))

     .pipe(sourcemaps.write('.'))
     .pipe(gulp.dest(paths.styles.dest))
     .pipe(browsersync.stream())
}

// Функция для преобразования js
function scripts() {
    return gulp.src(paths.scripts.src)
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(concat('index.min.js')) // Объединяем все файлы в один с указанным названием

    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(paths.scripts.dest))
    .pipe(browsersync.stream())
}

// Функция отслеживания действий
function watch() {
    browsersync.init({
        server: {
            baseDir: "./done/",
            index: "index.min.html"
        }
    })

    gulp.watch(paths.html.src, html)
    gulp.watch(paths.styles.src, styles)
    gulp.watch(paths.scripts.src, scripts)
    gulp.watch(paths.html.dest).on('change', browsersync.reload)
}

const build = gulp.series(clean, html, gulp.parallel(styles, scripts, imgcopy), watch);

exports.clean = clean;
exports.html = html;
exports.styles = styles;
exports.scripts = scripts;
exports.imgcopy = imgcopy;
exports.watch = watch;
exports.build = build;
exports.default = build; // Вызыввет build по одной команде gulp

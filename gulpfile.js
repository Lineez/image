let project_folder = 'docs'
let source_folder = '#src'

let path = {
  build: {
    html: project_folder + '/',
    pages: project_folder + '/pages/',
    css: project_folder + '/css/',
    js: project_folder + '/js/',
    img: project_folder + '/img/',
    fonts: project_folder + '/fonts/',
    iconFonts: project_folder + '/fonts/icon-font/',
  },

  src: {
    html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
    pages: [source_folder + '/pages/**/*.html'],
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/script.js',
    img: [source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}'],
    fonts: source_folder + '/fonts/*.woff2',
    iconFonts: source_folder + '/fonts/icon-font/**/*.*',
  },

  watch: {
    html: source_folder + '/**/*.html',
    pages: source_folder + '/pages/**/*.html',
    css: source_folder + '/scss/**/*.scss',
    js: source_folder + '/js/**/*.js',
    img: source_folder + '/img/**/*.{jpg,png,svg,gif,ico,webp}',
    iconFonts: source_folder + '/fonts/icon-font/**/*.*',
  },
  clean: './' + project_folder + '/',
}

let { src, dest } = require('gulp'),
  gulp = require('gulp'),
  browsersync = require('browser-sync').create(),
  fileInclude = require('gulp-file-include'),
  del = require('del'),
  scss = require('gulp-sass'),
  autoprefixer = require('gulp-autoprefixer'),
  group_media = require('gulp-group-css-media-queries'),
  clean_css = require('gulp-clean-css'),
  rename = require('gulp-rename'),
  uglify = require('gulp-uglify-es').default,
  imagemin = require('gulp-imagemin'),
  ttf2woff = require('gulp-ttf2woff'),
  ttf2woff2 = require('gulp-ttf2woff2'),
  fonter = require('gulp-fonter'),
  webpack = require('webpack-stream'),
  babel = require('gulp-babel')

function browserSync() {
  browsersync.init({
    server: {
      baseDir: './' + project_folder + '/',
    },
    port: 3000,
    notify: false,
  })
}

function watchFIles() {
  gulp.watch([path.watch.html], html)
  gulp.watch([path.watch.css], css)
  gulp.watch([path.watch.js], js)
  gulp.watch([path.watch.img], images)
  gulp.watch([path.watch.pages], pages)
}

function fonts() {
  return src(path.src.fonts).pipe(dest(path.build.fonts))
}
// each time convert ttf -> woff
// function fonts() {
// 	return src([source_folder + '/fonts/*.ttf'])
// 	.pipe(ttf2woff())
// 	.pipe(dest(path.build.fonts));
// }
// иконочный шрифт
function iconFonts() {
  return src([source_folder + '/fonts/icon-font/**/*.*']).pipe(
    dest(path.build.iconFonts),
  )
}

// convert ttf -> woff2
gulp.task('ttf2woff2', function () {
  return src([source_folder + '/fonts/*.ttf'])
    .pipe(ttf2woff2())
    .pipe(dest(source_folder + '/fonts/'))
})

// convert otf -> ttf
gulp.task('otf2ttf', function () {
  return src([source_folder + '/fonts/*.otf'])
    .pipe(
      fonter({
        formats: ['ttf'],
      }),
    )
    .pipe(dest(source_folder + '/fonts/'))
})

function images() {
  return src(path.src.img)
    .pipe(dest(path.build.img))
    .pipe(src(path.src.img))
    .pipe(
      imagemin({
        progressive: true,
        svgPlugins: [
          {
            removeVievBox: false,
          },
        ],
        interlaced: true,
        optimizationLevel: 3, // 0 to 7
      }),
    )
    .pipe(dest(path.build.img))
    .pipe(browsersync.stream())
}

function html() {
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(dest(path.build.html))
    .pipe(browsersync.stream())
}

function pages() {
  return src(path.src.pages)
    .pipe(fileInclude())
    .pipe(dest(path.build.pages))
    .pipe(browsersync.stream())
}

function css() {
  return src(path.src.css)
    .pipe(
      scss({
        outputStyle: 'expanded',
      }),
    )
    .pipe(group_media())
    .pipe(
      autoprefixer({
        overrideBrowserslist: ['last 5 versions'],
        cascade: true,
      }),
    )
    .pipe(dest(path.build.css))
    .pipe(clean_css())
    .pipe(
      rename({
        extname: '.min.css',
      }),
    )
    .pipe(dest(path.build.css))
    .pipe(browsersync.stream())
}

function js() {
  return src(path.src.js)
    .pipe(fileInclude())
    .pipe(
      webpack({
        mode: 'development',
        output: {
          filename: 'script.js',
        },
      }),
    )
    .pipe(
      babel({
        presets: ['@babel/preset-env'],
      }),
    )
    .pipe(dest(path.build.js))
    .pipe(uglify())
    .pipe(
      rename({
        extname: '.min.js',
      }),
    )
    .pipe(dest(path.build.js))
    .pipe(browsersync.stream())
}

function clean() {
  return del(path.clean)
}

let build = gulp.series(
  clean,
  gulp.parallel(fonts, iconFonts, html, pages, css, js, images),
)
let watch = gulp.parallel(build, watchFIles, browserSync)

exports.images = images
exports.js = js
exports.css = css
exports.html = html
exports.pages = pages
exports.build = build
exports.watch = watch
exports.default = watch

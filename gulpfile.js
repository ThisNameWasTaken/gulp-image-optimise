const gulp = require('gulp');
const rename = require('gulp-rename');
const runSequence = require('run-sequence');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const svgo = require('imagemin-svgo');
const gifsicle = require('imagemin-gifsicle');
const mozjpeg = require('imagemin-mozjpeg');
const imageResize = require('gulp-image-resize');
const sqip = require('gulp-sqip');
const webp = require('imagemin-webp');

const config = require('./config');

/**
 * A utility class with default values for a Config object
 */
class Defaults {
    static get SRC() { return './src/images'; }

    static get DEST() { return './dest/images'; }

    static get SIZES() { return []; }

    static get PLACEHOLDER() {
        return {
            SUFFIX: '-placeholder',
            PREFIX: '',
            NUMBER_OF_PRIMITIVES: 9
        };
    }

    static get COMPRESS() {
        return {
            mozjpeg: {
                dcScanOpt: 2
            },

            pngquant: {
                speed: 1,
            },

            svgo: {
                mergePaths: true
            },

            gifsicle: {
                interlaced: true,
                optimizationLevel: 3
            },

            webp: {
                method: 6
            }
        };
    }

    static get EXTENSIONS() {
        const extensions = 'jpeg,jpg,png,svg,gif,webp,bmp';

        return extensions + ',' + extensions.toUpperCase();
    }
}

/**
 * @param {*} object 
 * @returns {Boolean} whether or not the given object is iterable or not
 */
function isIterable(object) {
    return object != null && typeof object[Symbol.iterator] === 'function';
}

class Config {
    /**
     * @param {{src: String, dest: String, sizes: Array<Number>, placeholder: { prefix: String, suffix: String, numberOfPrimitives: Number}, extensions: String}} config the configuration for manipulating images
     * @param {String} config.src the source directory
     * @param {String} config.dest the destionation directory
     * @param {Array<Number>} config.sizes the heights to resize the images to, aspect ratio is maintained
     * @param {String} config.placeholder.prefix the prefix to append to the image's placeholder
     * @param {String} config.placeholder.suffix the suffix to append to the image's placeholder
     * @param {Number} config.placeholder.numberOfPrimitives the number of primitives to use when creating a placeholder
     * @param {String} config.extensions the extensions of the files to apply these modifications to
     */
    constructor(config = {}) {
        this.src = config.src || Defaults.SRC;
        this.dest = config.dest || Defaults.DEST;
        this.sizes = config.resize || Defaults.SIZES;
        this.placeholder = config.placeholder || DefaultsPLACEHOLDERS;
        this.placeholder == true ? DefaultsPLACEHOLDERS : this.placeholder;
        this.compress = config.compress || Defaults.COMPRESS;
        this.extensions = config.extensions || Defaults.EXTENSIONS;
    }
};

let configArray = [];

if (!isIterable(config)) {
    configArray = [new Config(config)];
} else {
    for (const elem of config) {
        configArray.push(new Config(elem));
    }
}

/** 
 * Resizes images based on the given configuration
 * @param {Config} config 
 */
function resizeImages(config = new Config()) {
    let stream = gulp.src(`${config.src}/*.{${config.extensions}}`);

    for (const size of config.sizes) {
        stream.pipe(imageResize({
            height: size,
            crop: false,
            upscale: false
        }))
            .pipe(rename({ suffix: `-${size}` }))
            .pipe(gulp.dest(config.dest));
    }

    // 
    return stream;
}

gulp.task('image-resize', function () {
    let stream;

    for (const config of configArray) {
        stream = resizeImages(config);
    }

    return stream;
});

/**
 * Creates a placeholder based on the given configuration
 * @param {Config} config 
 */
function createPlaceholders(config = new Config()) {
    // exclude existing svgs
    return gulp.src(`${config.src}/*.{${config.extensions.replace(/svg,?/ig, '')}}`)
        .pipe(sqip({ numberOfPrimitives: config.placeholder.numberOfPrimitives }))
        .pipe(rename({ suffix: config.placeholder.suffix, prefix: config.placeholder.prefix }))
        .pipe(gulp.dest(config.dest))
}

gulp.task('image-placeholders', function () {
    let stream;

    for (const config of configArray) {
        if (!config.placeholder || config.placeholder.disabled) {
            continue;
        }
        stream = createPlaceholders(config);
    }

    return stream;
});

/**
 * Compresses all images according to the given configuration
 * @param {Config} config 
 */
function compressImages(config = new Config()) {
    let imageminPlugins = [];

    if (config.compress.mozjpeg && config.compress.mozjpeg.disabled != false) {
        imageminPlugins.push(mozjpeg(config.compress.mozjpeg));
    }

    if (config.compress.pngquant && config.compress.pngquant.disabled != false) {
        imageminPlugins.push(pngquant(config.compress.pngquant));
    }

    if (config.compress.gifsicle && config.compress.gifsicle.disabled != false) {
        imageminPlugins.push(gifsicle(config.compress.gifsicle));
    }

    if (config.compress.svgo && config.compress.svgo.disabled != false) {
        imageminPlugins.push(svgo(config.compress.svgo));
    }

    return gulp.src(`${config.dest}/*.{${config.extensions}}`)
        .pipe(imagemin(imageminPlugins))
        .pipe(gulp.dest(config.dest))
}

gulp.task('image-compress', function () {
    let stream;

    for (const config of configArray) {
        if (!config.compress || config.compress.disabled == true) {
            continue;
        }
        stream = compressImages(config);
    }

    return stream;
});

/**
 * Converts jpeg, jpg and png images to webp according to the given configuration
 * @param {Config} config
 */
function convertToWebp(config) {
    return gulp.src(`${config.dest}/*.{jpeg,jpg,png,JPEG,JPG,PNG}`)
        .pipe(imagemin([webp(config.compress.webp)]))
        .pipe(rename({ extname: '.webp' }))
        .pipe(gulp.dest(config.dest))
}

gulp.task('webp-convert', function () {
    let stream;

    for (const config of configArray) {
        if (!config.compress || config.compress.disabled || !config.compress.webp || config.compress.webp.disabled) {
            continue;
        }
        stream = convertToWebp(config);
    }

    return stream;
});

gulp.task('images', done => runSequence('image-resize', 'image-placeholders', 'image-compress', 'webp-convert', done));
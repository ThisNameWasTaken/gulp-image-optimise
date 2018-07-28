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

const __size__ = '__size__';

/**
 * A utility class with default values for a Config object
 */
class Defaults {
    static get SRC() { return './src/images'; }

    static get DEST() { return 'dist/images'; }

    static get RESIZE() {
        return {
            disabled: false,
            sizes: [1080, 720, 480, 360],
            suffix: '-__size__',
            prefix: '',
        };
    }

    static get PLACEHOLDER() {
        return {
            disabled: false,
            suffix: '-placeholder',
            prefix: '',
            numberOfPrimitives: 9
        };
    }

    static get COMPRESS() {
        return {
            disabled: false,

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

    static get COPY() { return false; }

    static get EXTENSIONS() {
        const extensions = 'jpeg,jpg,png,svg,gif,webp,bmp';

        return extensions + ',' + extensions.toUpperCase();
    }
}

class Config {
    /**
     * @param {{src: String, dest: String, sizes: Array<Number>, placeholder: { prefix: String, suffix: String, numberOfPrimitives: Number}, extensions: String}} config the configuration for manipulating images
     * @param {String} config.src the source directory
     * @param {String} config.dest the destionation directory
     * @param {Array<Number>|{disabled: boolean, sizes: Array<Number>, prefix: String, suffix: String}} config.resize the heights to resize the images to, aspect ratio is maintained
     * @param {String} config.placeholder.prefix the prefix to append to the image's placeholder
     * @param {String} config.placeholder.suffix the suffix to append to the image's placeholder
     * @param {Number} config.placeholder.numberOfPrimitives the number of primitives to use when creating a placeholder
     * @param {String} config.extensions the extensions of the files to apply these modifications to
     */
    constructor(config = {}) {
        this.src = config.src || Defaults.SRC;
        this.dest = config.dest || Defaults.DEST;

        // if the vaule for resize is an array of sizes
        if (Array.isArray(config.resize)) {
            this.resize = Defaults.RESIZE;
            this.resize.sizes = config.resize;
        } else {
            this.resize = config.resize !== undefined ? config.resize : Defaults.RESIZE;
            this.resize = this.resize == true ? Defaults.RESIZE : this.resize;
        }

        this.placeholder = config.placeholder !== undefined ? config.placeholder : Defaults.PLACEHOLDER;
        this.placeholder = this.placeholder == true ? Defaults.PLACEHOLDER : this.placeholder;

        this.compress = config.compress !== undefined ? config.compress : Defaults.COMPRESS;
        this.compress = this.compress == true ? Defaults.COMPRESS : this.compress;

        this.copy = config.copy !== undefined ? config.copy : Defaults.COPY;

        this.extensions = config.extensions || Defaults.EXTENSIONS;
    }
};

let config;
let configArray = [];

try {
    config = require('./images.config');
} catch (error) {
    config = {};
}

if (!Array.isArray(config)) {
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

    for (let i = 0; i < config.resize.sizes.length; i++) {
        const size = config.resize.sizes[i];

        stream = stream.pipe(imageResize({
            height: size,
            crop: false,
            upscale: false
        }))
            .pipe(rename(function (path) {
                const prefix = config.resize.prefix.replace(__size__, size);
                const suffix = config.resize.suffix.replace(__size__, size);

                // if this is not the first renaming
                if (i > 0) {
                    // get the prvious the prefix and suffix
                    const previousSize = config.resize.sizes[i - 1];
                    const previousPrefix = config.resize.prefix.replace(__size__, previousSize);
                    const previousSuffix = config.resize.suffix.replace(__size__, previousSize);
                    // and remove them
                    path.basename = path.basename.replace(new RegExp(`^${previousPrefix}`), '');
                    path.basename = path.basename.replace(new RegExp(`${previousSuffix}$`), '');
                }

                path.basename = prefix + path.basename;
                path.basename += suffix;
            }))
            .pipe(gulp.dest(config.dest));
    }

    return stream;
}

gulp.task('image-resize', function () {
    let stream;

    for (const config of configArray) {
        // if image resizing is disabled
        if (!config.resize || config.resize.disabled) {
            continue; // skip creating image resizing
        }
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
        // if image placeholders are disabled
        if (!config.placeholder || config.placeholder.disabled) {
            continue; // skip creating image placeholders
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

    // if mozjpeg compression is enabled
    if (config.compress.mozjpeg && config.compress.mozjpeg.disabled != false) {
        // use mozjpeg compression
        imageminPlugins.push(mozjpeg(config.compress.mozjpeg));
    }

    // if pngquant compression is enabled
    if (config.compress.pngquant && config.compress.pngquant.disabled != false) {
        // use pngquant compression
        imageminPlugins.push(pngquant(config.compress.pngquant));
    }

    // if gifsicle compression is enabled
    if (config.compress.gifsicle && config.compress.gifsicle.disabled != false) {
        // use gifsicle compression
        imageminPlugins.push(gifsicle(config.compress.gifsicle));
    }

    // if svgo compression is enabled
    if (config.compress.svgo && config.compress.svgo.disabled != false) {
        // use svgo compression
        imageminPlugins.push(svgo(config.compress.svgo));
    }

    return gulp.src(`${config.dest}/*.{${config.extensions}}`)
        .pipe(imagemin(imageminPlugins))
        .pipe(gulp.dest(config.dest))
}

gulp.task('image-compress', function () {
    let stream;

    for (const config of configArray) {
        // if compression is disabled
        if (!config.compress || config.compress.disabled == true) {
            continue; // skip compression
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
        // if webp conversion is disabled
        if (!config.compress || config.compress.disabled || !config.compress.webp || config.compress.webp.disabled) {
            continue; // skip webp conversion 
        }
        stream = convertToWebp(config);
    }

    return stream;
});

/**
 * Copies images according to the given configuration
 * @param {Config} config
 */
function copyImages(config) {
    return gulp.src(`${config.src}/*.{${config.extensions}}`)
        .pipe(gulp.dest(config.dest));
}

gulp.task('image-copy', function () {
    let stream;

    for (const config of configArray) {
        // if coping is disabled
        if (!config.copy) {
            continue;   // skip coping
        }
        stream = copyImages(config);
    }

    return stream;
});

gulp.task('image-optimise', done => runSequence('image-copy', 'image-resize', 'image-placeholders', 'image-compress', 'webp-convert', done));
module.exports = [{
    src: './src/images',

    dest: './dist/images',

    resize: {
        // disabled: true,
        sizes: [1080, 720, 480, 360],
        suffix: '-__size__',
        prefix: '',
    },

    placeholder: {
        // disabled: true,
        suffix: '-placeholder',
        prefix: '',
        numberOfPrimitives: 8
    },

    compress: {
        // disabled: true,

        mozjpeg: {
            // disabled: true,
            // quality: 65,
            dcScanOpt: 2
        },

        pngquant: {
            // disabled: true,
            // quality: '65',
            speed: 1,
        },

        svgo: {
            // disabled: true,
            mergePaths: true
        },

        gifsicle: {
            // disabled: true,
            interlaced: true,
            optimizationLevel: 3
        },

        webp: {
            // disabled: true,
            // quality: 75,
            method: 6
        }
    },

    // copy: true
}];
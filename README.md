# Gulp Image Optimise

**Gulp Image Optimize** is a set of gulp tasks for optimizing images. It can compress, resize and create sqip placeholders for images.

## Requirements
Due to the fact that this setup uses [gulp-sqip](https://www.npmjs.com/package/gulp-sqip) you must install [Golang](https://golang.org/doc/install) and then get the [Primitive](https://github.com/fogleman/primitive) package with ```go get -u github.com/fogleman/primitive```. Make sure you add the path to the [Primitive](https://github.com/fogleman/primitive) binary file and the path to the `bin` folder inside your [Golang](https://golang.org/doc/install) installation directory.

## Installation
Open up a terminal inside the folder where you cloned this repository and run
```
npm install
```

## Usage
You can create a file called `images.config.js` where `gulpfile.js` is located and edit the configuration from there. If a config file is not provided the default values will be used.

To run the setup open up a terminal and run either ```npm run image-optimise``` or ```gulp image-optimise```.

Here is an example for the ```images.config.js``` file
```js
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
}, {
    src: './src/images/avatars',

    dest: './dist/images/avatars',

    resize: [480, 360, 240],
}];
```

## Options

### Config
<table style="width:100%">
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Default value</th> 
    <th>Description</th>
  </tr>
  <tr>
    <td>src</td>
    <td>String</td>
    <td><code>'./src/images'</code></td>
    <td>The source folder for the images.</td>
  </tr>
  <tr>
    <td>dest</td>
    <td>String</td>
    <td><code>'./dist/images'</code></td>
    <td>The destination folder for the images.</td>
  </tr>
  <tr>
    <td>resize</td>
    <td>Boolean | Array&ltNumber&gt | Object</td>
    <td><a href="#resize">Default resize options</a></td>
    <td>Options for resizing images and renaming them accordingly. When it is set to <code>false</code> image resizing is skipped. When it is set to <code>true</code> or <code>undefined</code> it uses the <a href="#resize">default value</a>.</td>
  </tr>
  <tr>
    <td>placeholder</td>
    <td>Boolean | Object</td>
    <td><a href="#placeholder">Default placeholder options</a></td></td>
    <td>Options for creating <a href="https://www.npmjs.com/package/sqip">SQIP</a> placeholders for images and renaming them accordingly. When it is set to <code>false</code> image placeholder creation is skipped. When it is set to <code>true</code> or <code>undefined</code> it uses the <a href="#placeholder">default value</a>.</td>
  </tr>
  <tr>
    <td>compress</td>
    <td>Boolean | Object</td>
    <td><a href="#resize">Default resize options</a></td>
    <td>Options for compresing images using <a herf="https://www.npmjs.com/package/imagemin">imagemin</a>. When it is set to <code>false</code> image compression is skipped. When it is set to <code>true</code> or <code>undefined</code> it uses the <a href="#compress">default value</a>.</td>
  </tr>
  <tr>
    <td>copy</td>
    <td>Boolean</td>
    <td><code>false</code></td>
    <td>Whether or not to copy the image at its original size. Note that it is still compressed if the option is enabled.</td>
  </tr>
  <tr>
    <td>extensions</td>
    <td>String</td>
    <td><code>'jpeg,jpg,png,gif,svg,bmp'</code></td>
    <td>The extensions for the images to be optimised.</td>
  </tr>
</table>

### Resize

<table style="width:100%">
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Default value</th> 
    <th>Description</th>
  </tr>
  <tr>
    <td>disabled</td>
    <td>Boolean</td>
    <td><code>false</code></td>
    <td>Whether or not to skip resizing images.</td>
  </tr>
  <tr>
    <td>sizes</td>
    <td>Array&ltNumber&gt</td>
    <td><code>[1080, 720, 480, 360]</code></td>
    <td>An array of widths (in pixels) to which the images should be resized. Note that aspect ratio is maintained.</td>
  </tr>
  <tr>
    <td>suffix</td>
    <td>String</td>
    <td><code>'-__size__'</code></td>
    <td>The string to append to the end of the name of the resized file.</td>
  </tr>
  <tr>
    <td>prefix</td>
    <td>String</td>
    <td><code>''</code></td>
    <td>The string to append to the start of the name of the resized file.</td>
  </tr>
</table>

<p>The <code>'__size__'</code> string is replaced with the width of the image. For instance, if the image was called <code>image.png</code>, the prefix value was <code>'-__size__px'</code> and the value for the sizes property was <code>[720]</code> the output would have been <code>image-720px.png</code>. The <code>__size__</code> can be used with either the <code>prefix</code> or <code>suffix</code> property.</p>

### Placeholder
<table style="width:100%">
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Default value</th> 
    <th>Description</th>
  </tr>
  <tr>
    <td>disabled</td>
    <td>Boolean</td>
    <td><code>false</code></td>
    <td>Whether or not to skip creating <a href="https://www.npmjs.com/package/sqip">SQIP</a> image placeholders.</td>
  </tr>
  <tr>
    <td>suffix</td>
    <td>String</td>
    <td><code>'-placeholder'</code></td>
    <td>The string to append to the end of the name of the resized file.</td>
  </tr>
  <tr>
    <td>prefix</td>
    <td>String</td>
    <td><code>''</code></td>
    <td>The string to append to the start of the name of the resized file.</td>
  </tr>
  <tr>
    <td>numberOfPrimitives</td>
    <td>Number</td>
    <td><code>8</code></td>
    <td>The number of primitive shapes used to create the svg.</td>
  </tr>
</table>

### Compress
<table style="width:100%">
  <tr>
    <th>Property</th>
    <th>Type</th>
    <th>Default value</th> 
    <th>Description</th>
  </tr>
  <tr>
    <td>disabled</td>
    <td>Boolean</td>
    <td><code>false</code></td>
    <td>Whether or not to skip image compression.</td>
  </tr>
  <tr>
    <td>mozjpeg</td>
    <td>Boolean | Object</td>
    <td><code>{ dcScanOpt: 2 }</code></td>
    <td>See the <a href="https://www.npmjs.com/package/imagemin-mozjpeg#options">mozjpeg options</a>. You can additionally disable it by either setting its value to <code>false</code> or by passing <code>disabled: false</code> to the options.</td>
  </tr>
  <tr>
    <td>pngquant</td>
    <td>Boolean | Object</td>
    <td><code>{ speed: 1 }</code></td>
    <td>See the <a href="https://www.npmjs.com/package/imagemin-pngquant#options">pngquant options</a>. You can additionally disable it by either setting its value to <code>false</code> or by passing <code>disabled: false</code> to the options.</td>
  </tr>
  <tr>
    <td>svgo</td>
    <td>Boolean | Object</td>
    <td><code>{ mergePaths: true }</code></td>
    <td>See the <a href="https://www.npmjs.com/package/imagemin-svgo#options">svgo options</a>. You can additionally disable it by either setting its value to <code>false</code> or by passing <code>disabled: false</code> to the options.</td>
  </tr>
  <tr>
    <td>gifsicle</td>
    <td>Boolean | Object</td>
    <td><code>{ interlaced: true, optimizationLevel: 3 }</code></td>
    <td>See the <a href="https://www.npmjs.com/package/imagemin-gifsicle#options">gifsicle options</a>. You can additionally disable it by either setting its value to <code>false</code> or by passing <code>disabled: false</code> to the options.</td>
  </tr>
  <tr>
    <td>webp</td>
    <td>Boolean | Object</td>
    <td><code>{ method: 6 }</code></td>
    <td>See the <a href="https://www.npmjs.com/package/imagemin-webp#options">webp options</a>. You can additionally disable it by either setting its value to <code>false</code> or by passing <code>disabled: false</code> to the options.</td>
  </tr>
</table>

## Plugins used
- [gulp-sqip](https://www.npmjs.com/package/gulp-sqip)
- [gulp-imagemin](https://www.npmjs.com/package/gulp-imagemin)
- [gulp-image-resize](https://www.npmjs.com/package/gulp-image-resize)
- [gulp-rename](https://www.npmjs.com/package/gulp-rename)
- [gulp-run-sequence](https://www.npmjs.com/package/run-sequence)

## License
MIT © [ThisNameWasTaken](https://github.com/ThisNameWasTaken)
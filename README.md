# object_painter

_object_painter is an open source project made with javascript that allows an application to paint an object image in different layers with canvas._

![](preview.gif)

## Designed for
Websites and applications who wants to deliver better experiences for your customers and any project that wants to implement an environment painter with a simple way to integrate using an easy api for that.
 
## Features

 * Loads a environment image
 * Add Layer mask to proccess object colors
 * Set fit mode to adapt the image on canvas
 * Set layer color to paint object
 * Get layer colors data
 * Get a specific layer color
 * Reset colors and fit

## Installation

This is a pure javascript library available through the
[npm registry](https://www.npmjs.com/object_painter) and no dependency is required.

```bash
$ npm install object_painter
```
To test the lib you must to have a local server like http://localhost because canvas check the CORS from image file data, so you can try:

```bash
$ npx http-server -c-1 -a localhost -p 8000 
```

## Usage

```html
<canvas width="400" height="300" id="room"></canvas>
<script src="node_modules/object_painter/src/object_painter.js"></script>
<script>
    const objectPainter = new ObjectPainter({
        canvasId: "room",
        fit: "stretch"
    });
    objectPainter.loadBackground('path/to/yours/image.jpg')
    objectPainter.addLayer('layer_name', 'path/to/yours/mask.png')
</script>
```

To have a great experience, your masks must have the same size of your original loaded image as background.

## API
* Before call any function, be sure to create an instance of library:
```javascript
    const objectPainter = new ObjectPainter({
        //The canvas identifier
        canvasId: "room",        
        //The image size adapter
        fit: "stretch",
    });
```

 * Loading a environment image as background:
```javascript
    objectPainter.loadBackground('path/to/yours/environment.png')
```

* Loading a mask image to proccess colors:
```javascript
    objectPainter.addLayer('layer_name','path/to/yours/mask.png')
```

* Setting the paint color to a specific layer:
```javascript
    objectPainter.setLayerColor('layer_name', "red")
```

* Setting the fit image adaptation to deliver a good experience:
```javascript
    objectPainter.setFit("stretch") //stretch, contain, cover
```

* Get a specific layer painted color:
```javascript
    objectPainter.getLayerColor("layer_name")
```

* Get all layer painted colors:
```javascript
    objectPainter.getColors()
```

* Remove all painted colors:
```javascript
    objectPainter.reset()
```

## License

  [MIT](LICENSE)
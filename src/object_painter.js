(function () {
    // Define our constructor
    this.ObjectPainter = function () {
        // Define imutable options defaults
        var unprops = {
            canvas: undefined,
            ctx: undefined,
            drawX: undefined,
            drawY: undefined,
            drawW: undefined,
            drawH: undefined,
            masks: {},
            assets: {},
            colors: {},
        }

        //define mutable options defaults
        var defaults = {
            canvasId: undefined,
            fit: "stretch"
        }
        // Create options by extending defaults with the passed in arugments
        if (arguments[0] && typeof arguments[0] === "object") {
            this.options = extendDefaults(defaults, arguments[0]);
            this.options = extendDefaults(this.options, unprops);
        }

        //initialize canvas
        this.options.canvas = document.getElementById(this.options.canvasId)
        this.options.ctx = this.options.canvas.getContext('2d');

        //render
        render.call(this)
    }

    //public methods

    ObjectPainter.prototype.loadBackground = function (src) {
        loadAsset.call(this, 'background', src)
    }

    ObjectPainter.prototype.addLayer = function (key, src) {
        loadAsset.call(this, key, src)
    }

    ObjectPainter.prototype.setLayerColor = function (key, color) {
        this.options.colors[key] = color;
        render.call(this)
    }
    
    ObjectPainter.prototype.getLayerColor = function (key) {
        return this.options.colors[key];
    }

    ObjectPainter.prototype.getColors = function () {
        return this.options.colors;
    }

    ObjectPainter.prototype.setFit = function (fitMode) {
        this.options.fit = fitMode;
        render.call(this)
    }

    ObjectPainter.prototype.reset = function () {
        this.options.colors = {};
    }

    //private methods
    function loadAsset(key, src) {
        var asset = new Image();
        asset.crossOrigin = "Anonymous";
        asset.onload = (e) => {
            this.options.assets[key] = asset;
            render.call(this);
        };
        asset.src = src;
    }

    function extendDefaults(source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    }

    function erase() {
        this.options.ctx.clearRect(0, 0, this.options.canvas.width, this.options.canvas.height);
    }

    function render() {
        erase.call(this)

        if (this.options.assets['background']) {
            //define render consts
            switch (this.options.fit) {
                case 'contain':
                case 'cover':
                    const { offsetX, offsetY, width, height } = fit.call(
                        this,
                        this.options.fit == 'contain',
                        this.options.canvas.width,
                        this.options.canvas.height,
                        this.options.assets['background'].width,
                        this.options.assets['background'].height
                    )
                    this.options.drawX = offsetX
                    this.options.drawY = offsetY
                    this.options.drawW = width
                    this.options.drawH = height
                    break;
                default:
                    this.options.drawX = 0
                    this.options.drawY = 0
                    this.options.drawW = this.options.canvas.width
                    this.options.drawH = this.options.canvas.height
                    break;

            }

            //make 
            for (const key of Object.keys(this.options.assets)) {
                if (key !== 'background') {
                    this.options.masks[key] = createMask.call(this, key)
                }
            }

            //draw background image
            this.options.ctx.save()
            this.options.ctx.drawImage(
                this.options.assets['background'],//background image
                0,//x location
                0,//y location
                this.options.assets['background'].width,
                this.options.assets['background'].height,
                this.options.drawX,//x
                this.options.drawY,//y
                this.options.drawW,//width
                this.options.drawH,//height
            );
            this.options.ctx.restore()

            //ready background image with grayscale only on masked area
            // * this helps to make the image most white closer to have a good blend color result
            let imageData = this.options.ctx.getImageData(0, 0, this.options.canvas.width, this.options.canvas.height)
            this.options.ctx.save()
            for (let i = 0; i < imageData.data.length; i += 4) {
                let data = imageData.data;
                for (const key of Object.keys(this.options.masks)) {
                    if (this.options.masks[key].hasOwnProperty(i)) {
                        let brightness = 0.34 * data[i] + 0.5 * data[i + 1] + 0.16 * data[i + 2];
                        data[i] = brightness;//red
                        data[i + 1] = brightness;//blue
                        data[i + 2] = brightness;//green
                        // overwrite original image
                    }
                }
            }
            this.options.ctx.putImageData(imageData, 0, 0);
            this.options.ctx.restore()

            //draw selected layer colors on mask pattern
            for (const key of Object.keys(this.options.masks)) {
                if (this.options.colors.hasOwnProperty(key)) {
                    this.options.ctx.save()
                    this.options.ctx.globalCompositeOperation = 'multiply';
                    this.options.ctx.fillStyle = this.options.colors[key];
                    let mask = this.options.masks[key];
                    for (const coord of Object.keys(mask)) {
                        this.options.ctx.fillRect(mask[coord][0], mask[coord][1], 1, 1);
                    }
                    this.options.ctx.restore()
                }
            }

        }
    }

    function createMask(key) {
        const pixels = [];
        //draw mask on canvas
        this.options.ctx.drawImage(
            this.options.assets[key],//background image
            0,//x location
            0,//y location
            this.options.assets[key].width,
            this.options.assets[key].height,
            this.options.drawX,//x
            this.options.drawY,//y
            this.options.drawW,//width
            this.options.drawH,//height
        );
        //read image from canvas
        let imageData = this.options.ctx.getImageData(0, 0, this.options.canvas.width, this.options.canvas.height)
        for (let i = 0; i < imageData.data.length; i += 4) {
            if (imageData.data[i + 3] !== 0) {
                pixels[i] = [
                    (i / 4) % this.options.canvas.width, //x
                    Math.floor((i / 4) / this.options.canvas.width)//y
                ]
            }
        }
        //clean canvas
        erase.call(this)
        return pixels;
    }

    function fit(contains, parentWidth, parentHeight, childWidth, childHeight, scale = 1, offsetX = 0.5, offsetY = 0.5) {
        const childRatio = childWidth / childHeight
        const parentRatio = parentWidth / parentHeight
        let width = parentWidth * scale
        let height = parentHeight * scale
        if (contains ? (childRatio > parentRatio) : (childRatio < parentRatio)) {
            height = width / childRatio
        } else {
            width = height * childRatio
        }
        return {
            width,
            height,
            offsetX: (parentWidth - width) * offsetX,
            offsetY: (parentHeight - height) * offsetY
        }
    }


}());
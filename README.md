![Pixels Image Preview](https://i.imgur.com/X4n19PP.png)


# Pixels Image React Component

[![npm version](https://badge.fury.io/js/react-pixels.svg)](https://badge.fury.io/js/react-pixels)

A React component for applying filters to images using the Pixels.js library (https://silvia-odwyer.github.io/pixels.js/)

## Demo

Check out the [CodeSandbox Demo](https://codesandbox.io/p/sandbox/busy-smoke-zqrpyd) to see the Pixels Image React Component in action!

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)

## Installation

You can install the Pixels Image React Component using npm:

```bash
npm install react-pixels
```

or yarn:

```bash
yarn add react-pixels
```

## Usage


### Apply Pixels.js Filters

```javascript
import React from 'react';
import { PixelsImage } from 'react-pixels';

function App() {
  return (
    <div>
      <h1>Pixels Image React Component</h1>
      <PixelsImage
        src="path/to/your/image.jpg"
        filter="greyscale" // or ["greyscale", ...] to apply more than one filter
      />
    </div>
  );
}

export default App;
```


### Edit saturation, hue, brightness, contrast

```javascript
import React from 'react';
import { PixelsImage } from 'react-pixels';

function App() {
  return (
    <div>
      <h1>Pixels Image React Component</h1>
      <PixelsImage
        src="path/to/your/image.jpg"
        saturation={0.5} // -1 to 1 (-100% to 100%)
        hue={-0.5} // -1 to 1 (-100% to 100%)
        brightness={1} // -1 to 1 (-100% to 100%)
        contrast={-0.2} // -1 to 1 (-100% to 100%)
      />
    </div>
  );
}

export default App;
```

### Flip Image

```javascript
import React from 'react';
import { PixelsImage } from 'react-pixels';

function App() {
  return (
    <div>
      <h1>Pixels Image React Component</h1>
      <PixelsImage
        src="path/to/your/image.jpg"
        horizontalFlip={true} // flip image horizontal
        verticalFlip={false} // flip image vertical
      />
    </div>
  );
}

export default App;
```

### Fast Load

```javascript
import React from 'react';
import { PixelsImage } from 'react-pixels';

function App() {
  return (
    <div>
      <h1>Pixels Image React Component</h1>
      <PixelsImage
        src={image} // HTMLImageElement (ref or instance of "new Image()")
        filter="greyscale"
      />
    </div>
  );
}

export default App;
```

### Export image

```javascript
import React from 'react';
import { PixelsImage } from 'react-pixels';

function App() {
  return (
    <div>
      <h1>Pixels Image React Component</h1>
      <PixelsImage
        src="path/to/your/image.jpg"
        filter="greyscale" // or ["greyscale", ...] to apply more than one filter
        brightness={0.2}
        onFilter={async (exportObject) => {
            await exportObject.getBlob() // for large images
            exportObject.getDataURL() // for small images
            exportObject.getCanvas() // get canvas object
            await exportObject.getImageFromDataURL() // same as getDataURL but as a <img> element
            await exportObject.getImageFromBlob() // same as getBlob but as a <img> element
        }}
      />
    </div>
  );
}

export default App;
```

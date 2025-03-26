# Swiss Ephemeris WebAssembly Integration

This document explains how to set up and use the Swiss Ephemeris WebAssembly integration in the Kaabalah library.

## Overview

The Swiss Ephemeris is a high-precision astronomical calculation library written in C that is widely used for astrological calculations. To use it in web browsers via our JavaScript/TypeScript library, we've created a WebAssembly wrapper.

## Prerequisites

To compile the Swiss Ephemeris to WebAssembly, you will need:

1. **Emscripten SDK (emsdk)**: The compiler toolchain for WebAssembly
   - Installation instructions: https://emscripten.org/docs/getting_started/downloads.html

2. **Swiss Ephemeris Source Code**: The C code that will be compiled
   - Download from: https://www.astro.com/swisseph/swesrc.htm

3. **Ephemeris Files**: Data files used by Swiss Ephemeris for calculations
   - Download from: https://www.astro.com/ftp/swisseph/ephe/

## Compilation Process

1. **Download the Swiss Ephemeris source code** and extract it to the `wasm/swisseph` directory

2. **Install Emscripten SDK** by following their installation instructions

3. **Compile the code** using the provided script:
   ```bash
   cd wasm/scripts
   chmod +x compile.sh
   ./compile.sh
   ```

4. **Verify the output files**:
   - `wasm/build/swisseph.js`: JavaScript glue code
   - `wasm/build/swisseph.wasm`: WebAssembly binary

## Integration with the Library

The Swiss Ephemeris WebAssembly integration is used by the astrology module to perform accurate astronomical calculations.

### Module Structure

- `src/astrology/swisseph.ts`: Wrapper that interfaces with the WebAssembly module
- `src/astrology/index.ts`: Main astrology functionality that uses the wrapper

### Dynamic Loading

The WebAssembly module is loaded dynamically at runtime, making it compatible with both Node.js and browser environments. This approach ensures that:

1. The heavy WebAssembly code is only loaded when needed
2. The same code works in both Node.js and browsers
3. The library can gracefully fall back if WebAssembly is not available

## Usage in Browser

To use the Swiss Ephemeris in a browser environment:

1. **Copy the WebAssembly files** to a location accessible by your web application:
   - `swisseph.js`
   - `swisseph.wasm`

2. **Handle cross-origin issues**: Ensure your web server is configured to serve WebAssembly files with the correct MIME type (`application/wasm`)

3. **Provide the ephemeris files** that Swiss Ephemeris needs for calculations:
   - Create a directory accessible by your web application
   - Place the ephemeris files (*.se1) in that directory
   - Specify the path when initializing the Swiss Ephemeris module

## Usage in Node.js

For Node.js environments:

1. **Include the built WebAssembly files** in your published package:
   - Add them to the `files` array in `package.json`
   - Make sure they're copied to the `dist` directory during build

2. **Place ephemeris files** in a known location:
   - For example, in a subdirectory named `ephe` within your package
   - Set the ephemeris path when initializing the module

## Fallback Mechanism

The astrology module includes a fallback mechanism to handle situations where the WebAssembly module might not be available:

1. If compilation fails or the WebAssembly files are missing, the module gracefully degrades
2. Placeholder values are returned instead of throwing errors
3. A warning is logged to the console

## Example Implementation

```typescript
import { getBirthChart } from 'kaabalah/astrology';

// Calculate a birth chart
const chart = await getBirthChart({
  date: new Date('1990-06-15T12:30:00'),
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: -4
});

console.log(`Ascendant: ${chart.ascendant}`);
console.log(`Sun position: ${chart.planets.sun.longitude}`);
```

## Troubleshooting

### Common Issues

1. **"WebAssembly module not found"**:
   - Ensure the .wasm and .js files are properly included in your distribution
   - Check the paths in your code

2. **"Cannot find ephemeris files"**:
   - Make sure the ephemeris files are available at the specified path
   - Check file permissions

3. **"Calculation error"**:
   - Verify the input parameters (date, location) are valid
   - Ensure you have the correct ephemeris files for the date range

### Debugging Tools

- Use browser developer tools to check for WASM-related errors in the console
- Enable the `ASSERTIONS=1` flag during compilation for more verbose error messages 
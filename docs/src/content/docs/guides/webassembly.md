---
title: WebAssembly Integration
description: How to set up and use the Swiss Ephemeris WebAssembly integration
sidebar:
  order: 2
---

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
4. **Verify the output files** in `wasm/build/`:
   - `swisseph.node.js` and `swisseph.node.wasm`: Node.js runtime
   - `swisseph.web.js` and `swisseph.web.wasm`: browser runtime

The published package already ships these files (`wasm/build`) and the three ephemeris files the library needs (`ephe/seas_18.se1`, `semo_18.se1`, `sepl_18.se1`), so you only compile them yourself when changing the C wrapper.

## Integration with the Library

The Swiss Ephemeris WebAssembly integration is used by the astrology module to perform accurate astronomical calculations.

### Module Structure

- `src/astrology/swisseph.ts`: Wrapper that interfaces with the WebAssembly module
- `src/astrology/index.ts`: Main astrology functionality that uses the wrapper

### Dynamic Loading

The WebAssembly module is loaded dynamically at runtime, making it compatible with both Node.js and browser environments. This approach ensures that:

1. WebAssembly loads on demand for astrology calculations, Maya birth cycles and sunset welcomes, and location-based Tattwa schedules.
2. The same code works in both Node.js and browsers
3. Initialization happens once per process; `getSwissEph()` is a no-op after the first call

## Initializing the runtime

Every astrology calculation initializes the runtime on first use, so most programs never call `getSwissEph` themselves. Call it explicitly to pick the asset locations or to receive setup notices:

```typescript
import { getSwissEph, closeSwissEph } from 'kaabalah/astrology';

await getSwissEph({
  wasmPath: '/srv/assets/swisseph.node.wasm', // optional override
  ephePath: '/srv/assets/ephe',               // optional override
  onRuntimeNotice: (message) => logger.debug(message), // default: stderr
});

// ...calculate charts...

closeSwissEph(); // release the instance when you are done
```

### How asset paths are resolved

In Node.js, each path (`wasmPath`, `ephePath`) is resolved in this order, and the first source that exists wins:

1. the explicit option you pass
2. the environment: `KAABALAH_SWISSEPH_WASM_PATH` or `KAABALAH_WASM_PATH`, and `KAABALAH_SWISSEPH_EPHE_PATH` or `KAABALAH_EPHE_PATH`
3. candidate paths you supply to `resolveSwissEphRuntimeAssets({ wasmPathCandidates, ephePathCandidates })`
4. the assets bundled with the package

An explicit or environment path that does not exist throws immediately instead of falling back. Use `resolveSwissEphRuntimeAssets(options?)` to see what would be used without starting the runtime; it returns `{ wasmPath, ephePath, wasmPathSource, ephePathSource }` where the sources are `"explicit"`, `"env"`, `"candidate"`, or `"bundled"`.

In a browser, the bundled defaults are relative URLs and the ephemeris files are fetched into the module's in-memory file system, so serve `ephe/` and the `.wasm` file from your own origin and pass `wasmPath` and `ephePath` explicitly when they are not next to your script.

### Package exports for bundlers

The package exposes the runtime assets directly so bundlers and servers can copy them without reaching into `node_modules` internals:

| Export | Node.js | Everything else |
| --- | --- | --- |
| `kaabalah/swisseph-runtime` | `wasm/build/swisseph.node.js` | `wasm/build/swisseph.web.js` |
| `kaabalah/swisseph-wasm` | `wasm/build/swisseph.node.wasm` | `wasm/build/swisseph.web.wasm` |

### Command line

The CLI takes `--wasm-path` and `--ephe-path` (or `KAABALAH_WASM_PATH` / `KAABALAH_EPHE_PATH`) and passes them to `getSwissEph`. A failure to start the runtime exits with `WASM_INIT_ERROR`. Runtime notices such as "Setting ephemeris path to ..." go to stderr; add `--quiet` to suppress them.

## Usage in Browser

To use the Swiss Ephemeris in a browser environment:

1. **Make the runtime files reachable**: `kaabalah/swisseph-runtime` and `kaabalah/swisseph-wasm` resolve to the web build (`swisseph.web.js`, `swisseph.web.wasm`).
2. **Handle cross-origin issues**: Ensure your web server is configured to serve WebAssembly files with the correct MIME type (`application/wasm`)
3. **Provide the ephemeris files** that Swiss Ephemeris needs for calculations:
   - Create a directory accessible by your web application
   - Place `seas_18.se1`, `semo_18.se1` and `sepl_18.se1` in that directory
   - Pass its URL as `ephePath` to `getSwissEph`

## Usage in Node.js

For Node.js environments the package works out of the box: the `.wasm` runtime and the ephemeris files ship inside it. To keep them elsewhere (for example in a read-only container image or a serverless layer), pass `wasmPath` and `ephePath`, or set the environment variables above.

## Missing assets

If the runtime cannot be found, initialization throws an error that lists the paths it checked. The library does not return placeholder values, so a failed `getSwissEph()` means no chart can be calculated.

## Example Implementation

```typescript
import { getBirthChart } from 'kaabalah/astrology';

// Calculate a birth chart
const chart = await getBirthChart({
  date: { year: 1990, month: 6, day: 15, hour: 12, minute: 30 },
  latitude: 40.7128,
  longitude: -74.006,
  timeZoneSettings: { timeZone: 'America/New_York' },
});

console.log(chart.houses.ascendant.sign);
console.log(chart.planets.sun.zodiacPosition.sign);
```

## Troubleshooting

### Common Issues

1. **"Unable to resolve Swiss Ephemeris wasmPath"** or **"wasmPath override does not exist"**:
   - Ensure the `.wasm` file is included in your distribution
   - Check the explicit option and the `KAABALAH_*` environment variables
2. **"Cannot find ephemeris files"**:
   - Make sure `seas_18.se1`, `semo_18.se1` and `sepl_18.se1` are available at the specified path
   - Check file permissions
3. **"Calculation error"**:
   - Verify the input parameters (date, location) are valid
   - Ensure you have the correct ephemeris files for the date range

### Debugging Tools

- Use browser developer tools to check for WASM-related errors in the console
- Run the CLI with `--debug` to log the resolved configuration and diagnostics to stderr
- Enable the `ASSERTIONS=1` flag during compilation for more verbose error messages

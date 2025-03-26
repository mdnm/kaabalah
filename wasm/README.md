# Swiss Ephemeris WebAssembly

This directory contains the necessary files to compile the Swiss Ephemeris C library to WebAssembly for use in both Node.js and browsers.

## Requirements

To compile the Swiss Ephemeris to WebAssembly, you will need:

1. Emscripten SDK (emsdk): https://emscripten.org/docs/getting_started/downloads.html
2. Swiss Ephemeris source code: https://www.astro.com/swisseph/swesrc.htm

## Setup Steps

1. Download the Swiss Ephemeris source code and extract it to the `swisseph` directory
2. Install Emscripten SDK
3. Run the compilation script

## Directory Structure

- `swisseph/` - Swiss Ephemeris source code
- `build/` - Compiled WebAssembly output
- `src/` - JavaScript/TypeScript wrapper code
- `scripts/` - Build scripts

## Compilation Process

The compilation process uses Emscripten to compile the C code to WebAssembly with the necessary JavaScript glue code.

### Key Files to Include

The minimal set of Swiss Ephemeris files needed:

- `sweph.c` - Main Swiss Ephemeris code
- `swephlib.c` - Swiss Ephemeris library functions
- `swepdate.c` - Date conversion utilities
- `swepcalc.c` - Planetary calculations
- `swehouse.c` - House systems calculations
- `swejpl.c` - JPL ephemeris handling

## Usage in Kaabalah

Once compiled, the WebAssembly module will be used by the astrology module to calculate accurate planetary positions and birth charts. 
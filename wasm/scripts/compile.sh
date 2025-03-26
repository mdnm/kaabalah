#!/bin/bash
# Swiss Ephemeris WebAssembly compilation script

# Ensure the script exits on any error
set -e

# Check if Emscripten SDK is available
if ! command -v emcc &> /dev/null; then
    echo "Error: Emscripten compiler (emcc) not found."
    echo "Please install Emscripten SDK: https://emscripten.org/docs/getting_started/downloads.html"
    exit 1
fi

# Directory setup
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"
SWEPH_DIR="$ROOT_DIR/swisseph"
BUILD_DIR="$ROOT_DIR/build"
SRC_DIR="$ROOT_DIR/src"

# Check if Swiss Ephemeris source is available
if [ ! -d "$SWEPH_DIR" ] || [ ! -f "$SWEPH_DIR/sweph.c" ]; then
    echo "Error: Swiss Ephemeris source code not found in $SWEPH_DIR"
    echo "Please download from https://github.com/aloistr/swisseph and extract to $SWEPH_DIR"
    exit 1
fi

# Create build directory if it doesn't exist
mkdir -p "$BUILD_DIR"

# Compilation flags
CFLAGS="-O3 -DUSE_STATIC -I$SWEPH_DIR"
EXPORTED_FUNCTIONS="['_malloc', '_free', '_swe_set_ephe_path', '_swe_close', '_swe_julday', '_swe_calc_ut', '_swe_houses', '_swe_house_pos', '_swe_azalt', '_swe_calc', '_swe_fixstar', '_swe_get_planet_name', '_swe_set_sid_mode', '_swe_set_topo', '_swe_set_jpl_file']"
EXPORTED_RUNTIME_METHODS="['ccall', 'cwrap', 'setValue', 'getValue', 'stringToUTF8', 'UTF8ToString', 'lengthBytesUTF8']"

echo "Compiling Swiss Ephemeris to WebAssembly..."

# Compile with Emscripten
emcc $CFLAGS \
    -s WASM=1 \
    -s MODULARIZE=1 \
    -s EXPORT_NAME="SwissEphemerisModule" \
    -s EXPORTED_FUNCTIONS="$EXPORTED_FUNCTIONS" \
    -s EXPORTED_RUNTIME_METHODS="$EXPORTED_RUNTIME_METHODS" \
    -s ALLOW_MEMORY_GROWTH=1 \
    -s INITIAL_MEMORY=16MB \
    -s MAXIMUM_MEMORY=128MB \
    -s ENVIRONMENT='web,node' \
    -s SINGLE_FILE=0 \
    -s ASSERTIONS=1 \
    -s STACK_OVERFLOW_CHECK=1 \
    -s SAFE_HEAP=1 \
    "$SWEPH_DIR/sweph.c" \
    "$SWEPH_DIR/swephlib.c" \
    "$SWEPH_DIR/swedate.c" \
    "$SWEPH_DIR/swehouse.c" \
    "$SWEPH_DIR/swejpl.c" \
    "$SWEPH_DIR/swemmoon.c" \
    "$SWEPH_DIR/swemplan.c" \
    "$SWEPH_DIR/swecl.c" \
    "$SWEPH_DIR/swehel.c" \
    -o "$BUILD_DIR/swisseph.js"

echo "Successfully compiled Swiss Ephemeris to WebAssembly"
echo "Output files: $BUILD_DIR/swisseph.js and $BUILD_DIR/swisseph.wasm" 
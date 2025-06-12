if (typeof scriptArgs === 'undefined' || scriptArgs.length < 1) {
  throw new Error("Usage: js compile-wat.js input.wat");
}

let watPath = scriptArgs[0];
let wasmPath = watPath.replace(/\.wat$/, '.wasm');

let watText = os.file.readFile(watPath); // UTF-8 string
let binary = wasmTextToBinary(watText);  // Uint8Array

os.file.writeTypedArrayToFile(wasmPath, binary);
print(`Wrote ${wasmPath} (${binary.length} bytes)`);

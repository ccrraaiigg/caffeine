// load_canvaskit.js
export async function loadCanvasKit() {
  const jsText = await Deno.readTextFile('./canvaskit.js')
  const wasmBinary = await Deno.readFile('./canvaskit.wasm')
  const CanvasKitInit = (new Function(`${jsText}; return CanvasKitInit;`))()

  const CanvasKit = await CanvasKitInit({
    locateFile: (f) => f,
    wasmBinary: wasmBinary.buffer})

  return CanvasKit}

const log = (...args) => {
  const out = document.getElementById('output');
  out.textContent += args.join(' ') + '\n';
  console.log(...args);
};

const go = async () => {
  const response = await fetch('gc_struct_reflection_full.wasm');
  const bytes = await response.arrayBuffer();

  const wasmModule = await WebAssembly.instantiate(bytes, {
    js: {
      log_callback: (x) => {
        log("Callback from WASM:", x);
        return x + 1;
      }
    }
  });

  const wasm = wasmModule.instance.exports;

  // Run all interop tests

  log("Add 2 + 3 =", wasm.add(2, 3));

  const cbResult = wasm.call_js(41);
  log("JS callback returned:", cbResult);

  try {
    wasm.maybe_throw(-5);
  } catch (e) {
    log("Caught WASM exception:", e);
  }

  const point = wasm.make_point(10, 20);
  log("Point X:", wasm.get_point_x(point));
  wasm.set_point_x(point, 99);
  log("New Point X:", wasm.get_point_x(point));
  log("Point reflection (X+Y):", wasm.reflect_point(point));

  log("Old global:", wasm.global.value);
  wasm.global.value = 321;
  log("New global:", wasm.global.value);

  const mem = new DataView(wasm.memory.buffer);
  wasm.store_value(0, 12345);
  log("Memory[0]:", wasm.load_value(0));
  log("Memory[0] (view):", mem.getInt32(0, true));

  const func = wasm.table.get(0);
  if (func) {
    const ret = func(77);
    log("Indirect JS call returned:", ret);
  } else {
    log("Table[0] is undefined.");
  }
};

go();

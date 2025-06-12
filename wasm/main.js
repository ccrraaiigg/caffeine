const log = (...args) => {
  const out = document.getElementById("log");
  out.textContent += args.join(" ") + "\n";
  console.log(...args);
};

const go = async () => {
  const exnTag = new WebAssembly.Tag({ parameters: ["i32"] });

  function throw_with_trace(value) {
    throw new WebAssembly.Exception(exnTag, [value], { traceStack: true });
  }

  const importObject = {
    js: {
      log_callback: (x) => {
        log("Callback from WASM:", x);
        return x + 1;
      },
      throw_with_trace
    }
  };

  const { instance } = await WebAssembly.instantiateStreaming(fetch("gc_struct_reflection_full.wasm"), importObject);
  const wasm = instance.exports;

  log("Add 2 + 3 =", wasm.add(2, 3));
  log("Callback from WASM:", wasm.call_js(41));

  try {
    wasm.maybe_throw(-5);
  } catch (e) {
    log("Caught WASM exception:", e);
    log("Stack:", e.stack);
  }

  const p = wasm.make_point(10, 109);
  log("Point X:", wasm.get_point_x(p));
  wasm.set_point_x(p, 99);
  log("New Point X:", wasm.get_point_x(p));
  log("Point reflection (X+Y):", wasm.reflect_point(p));

  log("Old global:", wasm.global.value);
  wasm.global.value = 321;
  log("New global:", wasm.global.value);

  wasm.store_value(0, 12345);
  log("Memory[0]:", wasm.load_value(0));
  log("Memory[0] (view):", new DataView(wasm.memory.buffer).getInt32(0, true));

  const cb = wasm.table.get(0);
  log("Indirect JS call returned:", cb(77));
};

go();

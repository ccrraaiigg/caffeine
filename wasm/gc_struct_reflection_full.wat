(module
  ;; ========== TYPES ==========
  (type $add_t (func (param i32 i32) (result i32)))
  (type $callback_t (func (param i32) (result i32)))
  (type $void (func))
  (type $point_t (struct (field (mut i32)) (field (mut i32))))

  ;; ========== IMPORTS ==========
  (import "js" "log_callback" (func $log_callback (type $callback_t)))
  (import "js" "throw_with_trace" (func $throw_with_trace (param i32)))

  ;; ========== TABLE ==========
  (table $t 1 funcref)
  (elem (i32.const 0) $log_callback)
  (export "table" (table $t))

  ;; ========== MEMORY ==========
  (memory $mem 1)
  (export "memory" (memory $mem))

  ;; ========== GLOBAL ==========
  (global $global (mut i32) (i32.const 0))
  (export "global" (global $global))

  ;; ========== FUNCTIONS ==========

  (func $add (type $add_t)
    local.get 0
    local.get 1
    i32.add)
  (export "add" (func $add))

  (func $call_js (param i32) (result i32)
    local.get 0
    i32.const 0
    call_indirect (type $callback_t))
  (export "call_js" (func $call_js))

  (func $maybe_throw (param i32)
    local.get 0
    i32.const 0
    i32.lt_s
    if
      local.get 0
      call $throw_with_trace
    end)
  (export "maybe_throw" (func $maybe_throw))

  (func $make_point (param i32 i32) (result eqref)
    local.get 0
    local.get 1
    struct.new $point_t)
  (export "make_point" (func $make_point))

  (func $get_point_x (param (ref null $point_t)) (result i32)
    local.get 0
    struct.get $point_t 0)
  (export "get_point_x" (func $get_point_x))

  (func $set_point_x (param (ref null $point_t)) (param i32)
    local.get 0
    local.get 1
    struct.set $point_t 0)
  (export "set_point_x" (func $set_point_x))

  (func $reflect_point (param (ref null $point_t)) (result i32)
    local.get 0
    struct.get $point_t 0
    local.get 0
    struct.get $point_t 1
    i32.add)
  (export "reflect_point" (func $reflect_point))

  (func $store_value (param i32) (param i32)
    local.get 0
    local.get 1
    i32.store)
  (export "store_value" (func $store_value))

  (func $load_value (param i32) (result i32)
    local.get 0
    i32.load)
  (export "load_value" (func $load_value))
)

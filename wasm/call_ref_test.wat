(module
  (type $t0 (func))

  (func $callback (type $t0)
    ;; do nothing
  )

  (func $main (type $t0)
    (local funcref)
    (local.set 0 (ref.func $callback))
    (local.get 0)
    call_ref
  )

  (export "go" (func $main))
)

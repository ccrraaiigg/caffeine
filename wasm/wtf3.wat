(module
  (type $t (func (param i32)))
  (tag $x (export "x") (type $t))
  (type $s (struct (field i32)))
  (func (export "make") (result (ref $s))
    struct.new $s
  )
)

(module
  (type $MyStruct (struct
    (field (mut externref))
    (field i32)
  ))

  (func $make_struct (export "make_struct")
    (param externref i32)
    (result (ref $MyStruct))
    struct.new $MyStruct
  )
)

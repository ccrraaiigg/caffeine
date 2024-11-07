(module 
 (type $tup (struct i64 i64 i32))
 (type $vec3d (array (mut f64)))
 (type $char-array (array (mut i32)))
 (type $buf (struct (field $pos (mut i64)) (field $chars (ref $char-array)))))

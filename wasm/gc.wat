(module
 (type $arrayType (array (mut i32)))
 
 (func $test (export "test")
;;       (result i32)
       (local $anArray (ref $arrayType))
       
       i32.const 0
       i32.const 1
       array.new $arrayType
       local.set $anArray

       local.get $anArray
       i32.const 0
       i32.const 3
       array.set $arrayType
       
       local.get $anArray
       i32.const 0
       array.get $arrayType
       drop))

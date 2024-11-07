(module
 (global $global (import "js" "myGlobal") (mut externref))
 (func $myFunction (result i32)
       ;; Access the object through $global and potentially call JavaScript functions
       i32.const 43
       )
 (export "myFunction" (func $myFunction))
 )

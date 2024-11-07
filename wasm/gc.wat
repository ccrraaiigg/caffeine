;; Test use of structs and arrays.

(module
 (type $point (struct
	       (field $x (mut i32))
	       (field $y (mut i32))))

 (type $char-array (array (mut i8)))
 
;; (type $object (struct
;;		(field $point (ref $point))))

 (type $object (struct (field $foo (ref $char-array))))
 
 (func $test (export "test")
       (result i32)
       (local $aPoint (ref $point))
       (local $anObject (ref $object))
       
       ;; Create a point.
       i32.const 0
       i32.const 0
       struct.new $point
       local.set $aPoint

       ;; Create an object and set its point to the created point.
       local.get $aPoint
       struct.new $object
       local.set $anObject

       ;; Set the x value of the object's point.
       local.get $anObject
       struct.get $object $point
       i32.const 4
       struct.set $point $x
       
       ;; Get the x value of the object's point.
       local.get $anObject
       struct.get $object $point
       struct.get $point $x

))

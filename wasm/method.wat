(module
 (type $bytes (array (mut i8)))
 (type $words (array (mut i32)))
 (type $pointers (array (ref $object)))

 (type $object (struct
		(field $metabits (mut i32))
		(field $class (ref $object))
		(field $format (mut i32))
		(field $hash (mut i32))
		(field $pointers (ref $pointers))
		(field $words (ref $words))
		(field $bytes (ref $bytes))
		(field $float (mut f32))
		(field $integer (mut i32))
		(field $address (mut i32))
		(field $nextObject (ref $object))))

 (import "catalyst" "vm" (global (ref $object))))

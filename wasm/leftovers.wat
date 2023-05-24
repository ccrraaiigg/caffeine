;; (func $readFromBuffer
;;       (local $littleEndian i32)
;;       (local $imageHeaderSize i32)
;;       (local $objectMemorySize i32)
;;       (local $oldBaseAddr i32)
;;       (local $specialObjectsOopInt i32)
;;       (local $index i32)
;;       (local $prevObj i32)
;;       (local $oopMap i32)
;;       (local $rawBits i32)
;;       (local $headerSize i32)
;;       (local $fileHeaderSize i32)
;;       
;;       i32.const 0x52454144 ;; 'READ'
;;       call $log
;;
;;       ;; Skip checking the image version.
;;       call $readWord
;;
;;       call $readWord
;;       local.set $imageHeaderSize
;;       call $readWord
;;       local.set $objectMemorySize
;;       call $readWord
;;       local.set $oldBaseAddr
;;       call $readWord
;;       local.set $specialObjectsOopInt
;;       call $readWord
;;       global.set $lastHash
;;       call $map
;;       global.set $savedHeaderWords
;;
;;       i32.const -1
;;       local.set $index
;;       
;;       (loop $loop
;;	     global.get $savedHeaderWords
;;	     call $readWord
;;	     call $push
;;	     local.get $index
;;	     i32.const 1
;;	     i32.add
;;	     local.set $index
;;	     local.get $index
;;	     i32.const 6
;;	     i32.lt_u
;;	     br_if $loop)
;;
;;       call $readWord
;;       global.set $firstSegSize
;;       call $map
;;       local.set $oopMap
;;       call $map
;;       local.set $rawBits
;;       local.get $fileHeaderSize
;;       local.get $imageHeaderSize
;;       i32.add
;;       local.set $headerSize
;;       local.get $headerSize
;;       global.set $position
;;
;;       (loop $loop
;;	     i32.const 0
;;	     local.set $nWords
;;	     i32.const 0
;;	     local.set $classInt
;;	     call $readWord
;;	     local.set $header
;;	     local.get $header
;;	     local.get $headerTypeMask
;;	     i32.and
;;	     global.set $temp
;;	     global.get $temp
;;	     local.get $headerTypeSizeAndClass
;;	     i32.eq
;;
;;	     (if
;;	      (then
;;	       local.get $header
;;	       i32.const 2
;;	       i32.shr_u
;;	       local.set $nWords
;;	       call $readWord
;;	       local.set $classInt
;;	       call $readWord
;;	       local.set $header)
;;	      (else
;;	       global.get $temp
;;	       local.get $headerTypeClass
;;	       i32.eq
;;	       (if
;;		(then
;;		 local.get $header
;;		 local.get $headerTypeClass
;;		 i32.sub
;;		 local.get $classInt
;;		 call $readWord
;;		 local.set $header)
;;		(else
;;		 global.get $temp
;;		 local.get $headerTypeShort
;;		 i32.eq
;;		 (if
;;		  (then
;;		   local.get $header
		   i32.const 2
		   i32.shr_u
		   i32.const 63
		   i32.and
		   local.set $nWords
		   local.get $header
		   i32.const 12
		   i32.shr_u
		   i32.const 31
		   i32.and
		   local.set $classInt))))))

	     local.get $nWords
	     i32.const 1
	     i32.sub
	     local.set $nWords
	     global.get $position
	     i32.const 4
	     i32.sub
	     local.get $headerSize
	     i32.sub
	     local.set $oop
	     local.get $header
	     i32.const 8
	     i32.shr_u
	     i32.const 15
	     i32.and
	     local.set $format
	     local.get $header
	     i32.const 17
	     i32.shr_u
	     i32.const 4095
	     i32.and
	     local.set $hash
	     local.get $nWords
	     local.get $format
	     i32.const 5
	     i32.le_u
	     call $readBits
	     local.set $bits
	     local.get $oop
	     local.get $classInt
	     local.get $format
	     local.get $hash
	     call $initFromImage
	     local.set $object
	     local.get $classInt
	     i32.const 32
	     i32.lt_u
	     (if
	      (then
	       local.get $object
	       local.get $object
	       call $getHash
	       i32.const 0x10000000
	       call $setHash))
	     local.get $prevObj
	     i32.const 0
	     i32.ne
	     (if
	      (then
	       local.get $prevObj
	       local.get $object
	       call $setNextObject))
	     local.get $oldSpaceCount
	     i32.const 1
	     i32.add
	     local.set $oldSpaceCount
	     local.get $object
	     local.set $prevObj
	     local.get $oopMap
	     local.get $oldBaseAddr
	     local.get $oop
	     i32.add
	     local.get $object
	     call $atPut
	     local.get $rawBits
	     local.get $oop
	     local.get $bits
	     call $atPut
	     global.get $position
	     local.get $headerSize
	     local.get $objectMemorySize
	     i32.add
	     i32.lt_u
	     br_if $loop)
       local.get $oopMap
       local.get $oldBaseAddr
       i32.const 4
       i32.add
       call $at
       local.set $firstOldObject
       local.get $object
       local.set $lastOldObject
       local.get $objectMemorySize
       local.set $oldSpaceBytes

       local.get $oopMap
       local.get $specialObjectsOopInt
       call $at
       local.set $splObs
       local.get $rawBits
       local.get $oopMap
       local.get $rawBits
       local.get $splObs
       call $getOop
       call $at
       local.get $splOb_CompactClasses
       call $at
       call $at
       call $at
       call $getOop
       local.set $cc
       i32.const 0
       local.set $renamedObj
       global.get $firstOldObject
       local.set $object
       i32.const 0
       local.set $prevObj

       (loop $loop
	     local.get $renamedObj
	     local.set $prevObj
	     


 
 (func $map
       (result i32)
       
       ;; Maps are stored as a linked list of memory cell
       ;; triples. Each triple has the address of the next triple in
       ;; the third cell. The first triple has the size of the map in
       ;; the first cell. The first cell of each subsequent triple has
       ;; a key, and the second cell has a value.
       
       global.get $nextAvailableAddress
       global.set $temp
       global.get $nextAvailableAddress
       i32.const 0
       i32.store
       global.get $nextAvailableAddress
       i32.const 3
       i32.add
       global.set $nextAvailableAddress
       global.get $temp)

 (func $at
       (param $startingAddress i32)
       (param $key i32)
       (local $address i32)

       ;; Find the triple with $key as its key. If we first encounter
       ;; a triple with 0xFFFFFFFF as its next-address, then there is
       ;; no such triple; do nothing.

       local.get $startingAddress
       local.set $address

       (block $none
	 (loop $loop
	       local.get $address
	       i32.const 2
	       i32.add
	       i32.load
	       local.set $address
	       local.get $address
	       i32.const 0xFFFFFFFF
	       i32.eq
	       br_if $none
	       local.get $address
	       i32.load
	       local.get $key
	       i32.eq
	       br_if $loop))

       local.get $address
       i32.const 1
       i32.add
       i32.load

       return)
       
 (func $atPut (export "atPut")
       (param $startingAddress i32)
       (param $key i32)
       (param $value i32)
       (local $address i32)

       ;; Find the triple with $key as its key, and write the value
       ;; there. If we first encounter a triple with 0xFFFFFFFF as its
       ;; next-address, that's the next available triple. Write the
       ;; key/value pair there, and set up a new empty triple.

       local.get $startingAddress
       local.set $address

       (block $new
	 (loop $loop
	       local.get $address ;; address of the next triple's first cell
	       i32.const 2
	       i32.add
	       i32.load
	       local.set $address
	       local.get $address
	       i32.const 0xFFFFFFFF
	       i32.eq
	       br_if $new
	       local.get $address
	       i32.load
	       local.get $key
	       i32.ne
	       br_if $loop))

       ;; Write $value.

       local.get $address
       i32.const 1
       i32.add
       local.get $value
       i32.store

       ;; Write the address of the next triple, and initialize the next triple.

       local.get $address
       i32.const 2
       i32.add
       global.get $nextAvailableAddress
       i32.store
       global.get $nextAvailableAddress
       i32.const 2
       i32.add
       global.set $nextAvailableAddress
       global.get $nextAvailableAddress
       i32.const 2
       i32.add
       i32.const 0xFFFFFFFF
       i32.store)

 (func $pushTriple
       (param $startingAddress i32)
       (param $value i32)
       (local $address i32)

       ;; Push $value in the next available triple rooted in
       ;; $startingAddress.

       local.get $startingAddress
       local.set $address

       (loop $loop
	     local.get $address ;; address of the next triple's first cell
	     i32.const 2
	     i32.add
	     i32.load
	     local.set $address
	     local.get $address
	     i32.const 0xFFFFFFFF
	     i32.ne
	     br_if $loop)

       global.get $nextAvailableAddress
       i32.const 1
       i32.add
       local.get $value
       i32.store
       global.get $nextAvailableAddress
       i32.const 2
       i32.add
       i32.const 0xFFFFFFFF
       i32.store
       global.get $nextAvailableAddress
       i32.const 3
       i32.add
       global.set $nextAvailableAddress)
 
;; (func $readWord
;;       (local $integer i32)
;;
;;       global.get $position
;;       global.get $littleEndian
;;       call $getUint32
;;       local.set $integer
;;       global.get $position
;;       i32.const 4
;;       i32.add
;;       global.set $position
;;       local.get $integer)

 (func $readBits
       (param $nWords i32)
       (param $isPointers i32)
       (local $oops i32) ;; memory address of an array, first element is array size
       (local $bits i32)
       
       local.get $isPointers
       
       (if
	(then
	 ;; Do endianness conversion.
	 global.get $nextAddress
	 local.set $oops
	 local.get $oops
	 i32.const 0
	 i32.store
	 
	 (loop $loop
	       local.get $oops
	       i32.load
	       local.get $nWords
	       i32.lt_u

	       (if
		(then
;;		 local.get $oops
;;		 call $readWord
;;		 call $push))
		 ))

	       local.get $oops
	       i32.load
	       local.get $nWords
	       i32.lt_u
	       br_if $loop)

	 local.get $oops
	 i32.load
	 return)
	(else
	 ;; words (no endianness conversion yet)
	 global.get $position
	 local.get $nWords
	 i32.const 42
	 call $pointer
	 local.set $bits
	 global.get $position
	 local.get $nWords
	 i32.const 4
	 i32.mul
	 i32.add
	 global.set $position
	 local.get $bits
	 return)))

 ;; Since, for now, there can be only one memory, memory has two
 ;; segments: a fixed-size segment of pointers, and a growable segment
 ;; of object memory. Each pointer is two 32-bit words: the first is
 ;; an address in the second segment, and the second has the
 ;; one-indexed element byte size in the high three bits, and a length
 ;; in the low 29 bits.

 (func $incrementNextAddress
       global.get $nextAddress
       i32.const 1
       i32.add
       global.set $nextAddress)

 ;; Allocate a new pointer.
 (func $pointer
       (param $address i32)
       (param $elementSizeIn32BitWords i32)
       (param $numberOfElements i32)
       (result i32)

       ;; Calculate the target address.
       global.get $startingObjectMemoryAddress
       global.get $position
       i32.add
       global.set $nextAddress

       ;; Write the target address to the next pointer address.
       local.get $address
       global.get $nextAddress
       i32.store
       call $incrementNextAddress

       ;; Write the pointee size to the next pointer address
       local.get $numberOfElements
       i32.const 536870911
       i32.and
       local.get $elementSizeIn32BitWords
       i32.const 29
       i32.shl
       i32.add
       global.get $nextAddress
       i32.store
       call $incrementNextAddress

       ;; Leave the first pointer address on the stack.
       global.get $temp)

 (func $sizeOfPointer
       (param $pointer i32)
       (result i32)

       local.get $pointer
       i32.const 1
       i32.add
       i32.load
       global.set $temp
       global.get $temp
       local.get $pointer
       i32.const 2
       i32.add
       i32.load
       i32.mul)


;; Each object is a WASMGC struct, with a 32-bit word of bitwise
;; metadata called "metabits" for indicating booleans such as isNil,
;; isTrue, etc.
;;
;; metabit 0: has pointers
;; metabit 1: has words
;; metabit 2: has bytes
;; metabit 3: isNil
;; metabit 4: isFalse
;; metabit 5: isFloat
;; metabit 6: isInteger
;; metabit 7: isFloatClass
;; metabit 8: isCompact
;; metabit 9: mark
;; metabit 10: dirty
;; metabit 11: hasNewInstances
;; metabit 12: isCompiled
;; metabit 13: hasClosures

(module
 ;; (import "wasm" "memory" (memory 1600 1800 shared))
 (memory $wasm.memory (import "wasm" "memory") 1)

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

 (type $atCacheEntry (struct
		      (field $array (ref $pointers))
		      (field $convertChars (mut i8))
		      (field $size (mut i32))
		      (field $ivarOffset (mut i32))))

 (type $atCacheArray (array (ref $atCacheEntry)))

 (global $activeContext (ref $object))
 (global $receiver (ref $object))
 (global $method (ref $object))
 (global $pc (mut i32) (i32.const 0))
 (global $sp (mut i32) (i32.const 0))
 (global $homeContext (ref $object))
 (global $hasClosures (mut i32) (i32.const 0))
 (global $freeContexts (ref $object) (global.get $nilObj))
 (global $freeLargeContexts (ref $object) (global.get $nilObj))
 (global $reclaimableContextCount (mut i32) (i32.const 0))
 (global $specialObjectsArray (ref $object))
 (global $verifyAtSelector (ref $object))
 (global $verifyAtClass (ref $object))
 (global $methodCacheRandomish (mut i32) (i32.const 0))
 (global $methodCacheMask (mut i32) (i32.const 0))
 (global $methodCache (ref $object))
 (global $nilObj (ref $object))
 (global $lastHash (mut i32) (i32.const 0))
 (global $youngObjectsCount (mut i32) (i32.const 0))
 (global $success (mut i32) (i32.const 0))
 (global $instructionCount (mut i32) (i32.const 0))
 (global $atCacheSize (mut i32) (i32.const 0))
 (global $atCacheMask (mut i32) (i32.const 0))
 (global $atPutCache (ref $atCacheArray))
 (global $atCache (ref $atCacheArray))
 (global $nonCachedInfo (ref $atCacheEntry))
 
 (func $initAtCache
       i32.const 32
       global.set $atCacheSize

       global.get $atCacheSize
       i32.const 1
       i32.sub
       global.set $atCacheMask

       global.get $atCacheSize ;; collection size
       struct.new $atCacheArray
       global.set $atCache

       i32.const 0
       i32.const 1024 ;; What should this be?
       struct.new $atCacheArray
       global.set $atPutCache)
       
 (func $beSuccessful
       i32.const 1
       global.set $success)
 
 (func $beUnsuccessful
       i32.const 0
       global.set $success)
 
 (func $metabitOfAt
       (param $object (ref $object))
       (param $index i32)
       (result i32)

       local.get $object
       struct.get $object $metabits
       local.get $index
       i32.shr_u
       i32.const 1
       i32.and)

 (func $setMetabitOfAt
       (param $object (ref $object))
       (param $index i32)

       local.get $object
       i32.const 1
       local.get $index
       i32.shl
       local.get $object
       struct.get $object $metabits
       i32.and
       struct.set $object $metabits)

 (func $clearMetabitOfAt
       (param $object (ref $object))
       (param $index i32)
       (local $mask i32)

       local.get $object
       i32.const 1
       local.get $index
       i32.shl
       local.set $mask
       local.get $object
       struct.get $object $metabits
       local.get $mask
       i32.xor
       local.get $mask
       i32.xor
       struct.set $object $metabits)

 (func $hasPointers
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 0
       call $metabitOfAt)

 (func $havePointers
       (param $object (ref $object))

       local.get $object
       i32.const 0
       call $setMetabitOfAt)
 
 (func $hasWords
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 1
       call $metabitOfAt)

 (func $haveWords
       (param $object (ref $object))

       local.get $object
       i32.const 1
       call $setMetabitOfAt)

 (func $hasBytes
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 2
       call $metabitOfAt)

 (func $haveBytes
       (param $object (ref $object))

       local.get $object
       i32.const 2
       call $setMetabitOfAt)

 (func $isNil
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 3
       call $metabitOfAt)

 (func $beNil
       (param $object (ref $object))

       local.get $object
       i32.const 3
       call $setMetabitOfAt)

 (func $isFalse
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 4
       call $metabitOfAt)

 (func $beFalse
       (param $object (ref $object))

       local.get $object
       i32.const 4
       call $setMetabitOfAt)

 (func $isFloat
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 5
       call $metabitOfAt)

 (func $beFloat
       (param $object (ref $object))

       local.get $object
       i32.const 5
       call $setMetabitOfAt)

 (func $isInteger
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 6
       call $metabitOfAt)
 
 (func $beInteger
       (param $object (ref $object))

       local.get $object
       i32.const 6
       call $setMetabitOfAt)
 
 (func $isFloatClass
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 7
       call $metabitOfAt)

 (func $beFloatClass
       (param $object (ref $object))

       local.get $object
       i32.const 7
       call $setMetabitOfAt)

 (func $isCompact
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 8
       call $metabitOfAt)

 (func $beCompact
       (param $object (ref $object))

       local.get $object
       i32.const 8
       call $setMetabitOfAt)

 (func $isMarked
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 9
       call $metabitOfAt)

 (func $beMarked
       (param $object (ref $object))

       local.get $object
       i32.const 9
       call $setMetabitOfAt)

 (func $isDirty
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 10
       call $metabitOfAt)

 (func $beDirty
       (param $object (ref $object))

       local.get $object
       i32.const 10
       call $setMetabitOfAt)

 (func $hasNewInstances
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 11
       call $metabitOfAt)

 (func $haveNewInstances
       (param $object (ref $object))

       local.get $object
       i32.const 11
       call $setMetabitOfAt)
       
 (func $isCompiled
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 12
       call $metabitOfAt)

 (func $beCompiled
       (param $object (ref $object))

       local.get $object
       i32.const 12
       call $setMetabitOfAt)
       
 (func $hasClosures
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 13
       call $metabitOfAt)

 (func $haveClosures
       (param $object (ref $object))

       local.get $object
       i32.const 13
       call $setMetabitOfAt)
       
 (func $numberOfWordsOf
       (param $object (ref $object))
       (result i32)
       (local $header i32)
       (local $headerType i32)
       
       local.get $object
       call $load32BitInteger
       local.set $header
       local.get $object
       call $headerType
       local.set $headerType
       local.get $headerType
       i32.const 0 ;; Squeak.HeaderTypeSizeAndClass
       i32.eq

       (if (result i32)
	   (then
	    local.get $header
	    i32.const 2
	    i32.shr_u)
	   (else
	    local.get $header
	    i32.const 2
	    i32.shr_u
	    i32.const 63
	    i32.and)))

 (func $exportThisContext
       (result (ref $object))

       i32.const 0
       global.set $reclaimableContextCount
       global.get $activeContext)

 (func $isContext
       (param $object (ref $object))
       (result i32)
       (local $class (ref $object))

       local.get $object
       struct.get $object $class
       local.set $class
       local.get $class
       i32.const 10 ;; Squeak.splOb_ClassMethodContext
       call $specialObjectAt
       i32.eq

       (if (result i32)
	   (then
	    i32.const 1)
	   (else
	    local.get $class
	    i32.const 11 ;; Squeak.splOb_ClassBlockContext
	    call $specialObjectAt
	    i32.eq

	    (if (result i32)
		(then
		 i32.const 1)
		(else
		 i32.const 0)))))

 (func $isMethodContext
       (param $object (ref $object))
       (result i32)

       local.get $object
       struct $object $class
       i32.const 10 ;; Squeak.splOb_ClassMethodContext
       call $specialObjectAt
       i32.eq)

 (func $pointersSize
       (param $object (ref $object))
       (result i32)

       local.get $object
       call $hasPointers

       (if (result i32)
	   (then
	    local.get $object
	    call $numberOfWordsOf)
	   (else
	    i32.const 0)))
 
 (func $decodeSqueakPC
       (param $squeakPC i32)
       (param $method (ref $object))
       (result i32)

       local.get $squeakPC
       local.get $method
       call $numberOfWordsOf
       i32.const 4
       i32.mul
       i32.sub
       i32.const 1
       i32.sub)
 
 (func $decodeSqueakSP
       (param $intSP i32)
       (result i32)

       local.get $intSP
       i32.const 6 ;; Squeak.Context_tempFrameStart
       i32.sub
       i32.const 1
       i32.sub)

 (func $methodPrimitiveIndex
       (param $method (ref $object))
       (result i32)
       (local $primBits i32)

       local.get $method
       i32.const 0
       call $integerOfAt
       i32.const 0x300001FF
       i32.and
       local.set $primBits
       local.get $primBits
       i32.const 0x1FF
       i32.gt_u

       (if (result i32)
	   (then
	    local.get $primBits
	    i32.const 0x1FF
	    i32.and
	    local.get $primBits
	    i32.const 19
	    i32.shr_u
	    i32.add)
	   (else
	    local.get $primBits)))

 (func $cannotReturn
       (param $returnValue i32)
       (local $cannotReturnSelector (ref $object))

       call $exportThisContext
       call $pushPointer
       local.get $returnValue
       call $pushPointer
       i32.const 21 ;; Squeak.splOb_SelectorCannotReturn
       call $specialObjectAt
       local.set $cannotReturnSelector
       local.get $cannotReturnSelector
       i32.const 1
       i32.const 0
       call $send)
 
 (func $isUnwindMarked
       (param $context (ref $object))
       (result i32)
       (local $method (ref $object))
       
       local.get $context
       call $isMethodContext
       i32.eqz

       (if (result i32)
	   (then
	    i32.const 0
	    return)
	   (else
	    local.get $context
	    i32.const 3 ;; Squeak.Context_method
	    call $pointerOfAt
	    local.set $method
	    local.get $method
	    call $methodPrimitiveIndex
	    i32.const 198
	    i32.eq)))
 
 (func $recycleIfPossible
       (param $context (ref $object))

       local.get $context
       call $isMethodContext
       i32.eqz
       (if (then return))

       local.get $context
       call $pointersSize
       i32.const 22 ;; Squeak.Context_tempFrameStart + Squeak.Context_smallFrameSize
       i32.eq

       (if
	(then
	 ;; recycle small contexts

	 local.get $context
	 i32.const 0
	 global.get $freeContexts
	 call $pointerOfAtPutPointer
	 local.get $context
	 global.set $freeContexts)
	(else
	 ;; recycle large contexts

	 local.get $context
	 call $pointersSize
	 i32.const 62 ;; Squeak.Context_tempFrameStart + Squeak.Context_largeFrameSize
	 i32.eq
	 i32.eqz
	 (if (then return))

	 local.get $context
	 i32.const 0
	 global.get $freeLargeContexts
	 call $pointerOfAtPutPointer
	 local.get $context
	 global.set $freeLargeContexts)))
 
 (func $fetchContextRegisters
       (param $context (ref $object))
       (local $method i32)

       local.get $context
       i32.const 3 ;; Squeak.Context_method
       call $pointerOfAt
       local.set $method
       local.get $method
       ref.test $object

       (if
	(then
	 ;; If the value of the method field is an object, home = context

	 local.get $context
	 global.set $homeContext)
	(else
	 ;; ...otherwise, the active context is a block context.

	 local.get $context
	 i32.const 5 ;; Squeak.BlockContext_home
	 call $pointerOfAt
	 global.set $homeContext
	 global.get $homeContext
	 i32.const 3 ;; Squeak.Context_method
	 call $pointerOfAt
	 local.set $method))

       global.get $homeContext
       i32.const 5 ;; Squeak.Context_receiver
       call $pointerOfAt
       global.set $receiver
       local.get $method
       global.set $method
       local.get $context
       i32.const 1 ;; Squeak.Context_instructionPointer
       call $pointerOfAt
       local.get $method
       call $decodeSqueakPC
       global.set $pc
       local.get $context
       i32.const 2 ;; Squeak.Context_stackPointer
       call $pointerOfAt
       call $decodeSqueakSP
       global.set $sp
       return)

 (func $aboutToReturnThrough
       (param $result i32)
       (param $context (ref $object))
       (local $aboutToReturnSelector (ref $object))

       call $exportThisContext
       call $pushPointer
       local.get $result
       call $pushPointer
       local.get $context
       i32.const 48 ;; Squeak.splOb_SelectorAboutToReturn
       call $specialObjectAt
       local.set $aboutToReturnSelector
       local.get $aboutToReturnSelector
       i32.const 2
       call $send)
 
 (func $doReturn
       (param $returnValue (ref $object))
       (param $targetContext (ref $object))
       (local $context (ref $object))
       (local $closure (ref $object))
       (local $nextContext (ref $object))

       local.get $targetContext
       i32.eqz

       (if
	(then
	 global.get $homeContext
	 local.set $context
	 global.get $hasClosures

	 (if
	  (then
	   (loop $loop1
		 local.get $context
		 i32.const 4 ;; Squeak.Context_closure
		 call $pointerOfAt
		 call $isNil

		 (if
		  (then
		   local.get $closure
		   i32.const 0 ;; Squeak.Closure_outerContext
		   call $pointerOfAt
		   local.set $context
		   i32.const 1
		   br_if $loop1)))))

	 local.get $context
	 i32.const 0 ;; Squeak.Context_sender
	 call $pointerOfAt
	 local.set $targetContext))

       local.get $targetContext
       call $isNil
       local.get $targetContext
       i32.const 1 ;; Squeak.Context_instructionPointe
       call $pointerOfAt
       call $isNil
       i32.or

       (if
	(then
	 local.get $returnValue
	 call $cannotReturn
	 return))

       ;; search up stack for unwind
       global.get $activeContext
       i32.const 0 ;; Squeak.Context_sender
       call $pointerOfAt
       local.set $context

       local.get $context
       local.get $targetContext
       i32.eq
       i32.eqz

       (if
	(then
	 (loop $loop2
	       local.get $context
	       call $isNil

	       (if
		(then
		 local.get $returnValue
		 call $cannotReturn
		 return))

	       local.get $context
	       call $isUnwindMarked

	       (if
		(then
		 local.get $returnValue
		 local.get $context
		 call $aboutToReturnThrough
		 return))

	       local.get $context
	       i32.const 0
	       call $pointerOfAt
	       local.set $context
	       
	       local.get $context
	       local.get $targetContext
	       i32.eq
	       i32.eqz
	       br_if $loop2)))

       ;; no unwind to worry about, just peel back the stack (usually just to sender)
       global.get $activeContext
       local.set $context
       local.get $context
       local.get $targetContext
       i32.eq
       i32.eqz

       (if
	(then
	 (loop $loop3
	       local.get $context
	       i32.const 0 ;; Squeak.Context_sender
	       call $pointerOfAt
	       local.set $nextContext
	       local.get $context
	       i32.const 0 ;; Squeak.Context_sender
	       i32.const 4 ;; nilObj
	       call $pointerOfAtPutPointer
	       local.get $context
	       i32.const 1 ;; Squeak.Context_instructionPointer
	       i32.const 4 ;; nilObj
	       call $pointerOfAtPutPointer
	       global.get $reclaimableContextCount
	       i32.const 0
	       i32.gt_u

	       (if
		(then
		 global.get $reclaimableContextCount
		 i32.const 1
		 i32.sub
		 global.set $reclaimableContextCount
		 local.get $context
		 call $recycleIfPossible))
	       
	       local.get $nextContext
	       local.set $context
	       local.get $context
	       local.get $targetContext
	       i32.eq
	       i32.eqz
	       br_if $loop3)))

       local.get $context
       global.set $activeContext
       global.get $activeContext
       call $beDirty
       global.get $activeContext
       call $fetchContextRegisters
       local.get $returnValue
       call $pushPointer)
 
 (func $encodeSmallInteger
       (param $integer i32)
       (result i32)
       
       local.get $integer
       i32.const 1
       i32.shl
       i32.const 1
       i32.or)

 (func $switch32BitEndianness
       (param $input i32)
       (result i32)
       (local $result i32)

       local.get $input
       i32.const 0xFF
       i32.and
       i32.const 24
       i32.shl
       local.set $result
       local.get $input
       i32.const 0xFF00
       i32.and
       i32.const 8
       i32.shl
       local.get $result
       i32.add
       local.set $result
       local.get $input
       i32.const 0xFF0000
       i32.and
       i32.const 8
       i32.shr_u
       local.get $result
       i32.add
       local.set $result
       local.get $input
       i32.const 0xFF000000
       i32.and
       i32.const 24
       i32.shr_u
       local.get $result
       i32.add)

 (func $store32BitFloat
       (param $object i32)
       (param $value f32)

       local.get $object
       local.get $value
       f32.store)
 
 (func $store32BitInteger
       (param $object i32)
       (param $value i32)

       local.get $value
       i32.const 0x80000000
       i32.eq
       (if
	(then
	 unreachable))
       
       local.get $object
       local.get $value
       call $switch32BitEndianness
       i32.store)
 
 (func $load32BitInteger
       (param $object i32)
       (result i32)

       local.get $object
       i32.const 0
       i32.lt_s
       (if (result i32)
	   (then
	    unreachable)
	   (else
	    local.get $object
	    i32.const 104857600
	    i32.gt_u
	    (if (result i32)
		(then
		 unreachable)
		(else
		 local.get $object
		 i32.load
		 call $switch32BitEndianness)))))

 (func $integerOfAt
       (param $object i32)
       (param $index i32)
       (result i32)
       (local $value i32)

       local.get $object
       local.get $index
       call $pointerOfAt
       local.set $value
       local.get $value
       i32.const 1
       i32.and
       (if (result i32)
	   (then
	    local.get $value
	    i32.const 1
	    i32.shr_s)
	   (else
	    local.get $value)))
 
 (func $pointerOfAt
       (param $object (ref $object))
       (param $index i32)
       (result i32)
       
       local.get $object
       struct.get $object $pointers
       local.get $index
       array.get)

 (func $recordDirtyObject
       (param $object (ref $object))
       (local $currentAddress i32)

       global.get $dirtyTableAddress
       local.get $object
       call $store32BitInteger
       global.get $dirtyTableAddress
       i32.const 4
       i32.add
       global.set $dirtyTableAddress
       global.get $dirtyTableAddress
       i32.const 0x0FFFFFFF
       call $store32BitInteger)

 (func $pointerOfAtPutObject
       (param $receiver (ref $object))
       (param $index i32)
       (param $object (ref $object))

       local.get $receiver
       struct.get $object $pointers
       local.get $index
       local.get $object
       array.put)

 (func $objectForInteger
       (param $integer i32)
       (result (ref $object))
       (local $object (ref $object))

       struct.new $object
       local.set $object
       local.get $object
       local.get $integer
       struct.set $object $integer
       local.get $object
       call $beInteger
       local.get $object)
 
 (func $pointerOfAtPutInteger
       (param $receiver (ref $object))
       (param $index i32)
       (param $integer i32)

       local.get $receiver
       local.get $index
       local.get $integer
       call $objectForInteger




       
 (func $activeContext
       (result i32)
       (local $result i32)
       
       i32.const 3
       call $specialObjectAt ;; fetch the address of the Processor association
       global.set $association
       global.get $association
       i32.const 1
       call $pointerOfAt ;; fetch the address of the Processor
       global.set $processor
       global.get $processor
       i32.const 1
       call $pointerOfAt ;; fetch the address of the active Process
       global.set $process
       global.get $process
       i32.const 1
       call $pointerOfAt
       local.set $result
       local.get $result
       i32.const 0
       i32.lt_s
       (if (result i32)
	   (then
	    ;; The active context is a young object; fetch it via the young objects table.
	    i32.const 100000000
	    local.get $result
	    i32.const 4
	    i32.mul
	    i32.sub
	    call $load32BitInteger)
	   (else
	    local.get $result
	    i32.eqz
	    (if (result i32)
		(then
		 unreachable)
		(else
		 local.get $result
		 global.set $activeContext
		 local.get $result))))) ;; fetch the address of the active Context

 (func $method
       (result i32)
       (local $temp i32)
       
       call $homeContext
       i32.const 3
       call $pointerOfAt
       global.set $method
       global.get $method)

 (func $headerType
       (param $object (ref $object))
       (result i32)

       local.get $object
       call $load32BitInteger
       i32.const 3 ;; Squeak.HeaderTypeMask
       i32.and)
 
 (func $numberOfObjectHeaderWords
       (param $object (ref $object))
       (result i32)
       (local $headerType i32)

       local.get $object
       call $headerType
       local.set $headerType
       local.get $headerType
       i32.const 0 ;; Squeak.HeaderTypeSizeAndClass
       i32.eq
       (if (result i32)
	   (then
	    i32.const 3)
	   (else
	    local.get $headerType
	    i32.const 1 ;; Squeak.HeaderTypeClass
	    i32.eq
	    (if (result i32)
		(then
		 i32.const 2)
		(else
		 local.get $headerType
		 i32.const 3 ;; Squeak.HeaderTypeShort
		 i32.eq
		 (if (result i32)
		     (then
		      i32.const 1)
		     (else
		      unreachable)))))))
 
 (func $methodBytes
       (result i32)

       call $numberOfMethodLiterals
       i32.const 4
       i32.mul
       call $method
       i32.add
       global.get $method
       call $numberOfObjectHeaderWords
       i32.const 1
       i32.add
       i32.const 4
       i32.mul
       i32.add ;; skip the object header words and the method header word
       )

 (func $objectOfProgramCounter
       (result i32)

       call $activeContext
       i32.const 8
       i32.add)
 
 (func $pc
       (result i32)

       call $objectOfProgramCounter
       call $load32BitInteger ;; fetch the encoded (SmallInteger *and* byte-offset) program counter
       i32.const 1
       i32.shr_u
       call $numberOfMethodLiterals
       i32.const 1
       i32.add
       i32.const 4
       i32.mul
       i32.sub
       i32.const 1
       i32.sub
       global.set $pc
       global.get $pc)

 (func $pcThenIncrement
       (result i32)
       (local $currentPC i32)
       
       call $pc
       local.set $currentPC
       local.get $currentPC
       i32.const 1
       i32.add
       call $setPC
       local.get $currentPC)

 (func $numberOfMethodLiterals
       (result i32)

       call $method
       i32.const 0
       call $integerOfAt ;; fetch the SmallInteger header of the active method
       i32.const 9
       i32.shr_u ;; shift out the primitive bits
       i32.const 255
       i32.and ;; the number of literals
       )
 
 (func $setPC
       (param $newPC i32)

       local.get $newPC
       global.set $pc

       call $objectOfProgramCounter

       local.get $newPC
       call $numberOfMethodLiterals
       i32.const 1
       i32.add
       i32.const 4
       i32.mul
       i32.const 1
       i32.add
       i32.add
       call $encodeSmallInteger
       call $store32BitInteger
       call $activeContext
       call $recordDirtyObject)

 (func $nextByte
       (result i32)
       (local $theMethodBytes i32)
       (local $thePC i32)
       (local $object i32)
       
       call $methodBytes
       local.set $theMethodBytes
       local.get $theMethodBytes
       call $pcThenIncrement
       local.set $thePC
       local.get $thePC
       i32.add
       local.set $object
       local.get $object
       i32.const 104857600
       i32.ge_s
       (if
	(then
	 unreachable))
       local.get $object
       i32.load ;; load little-endian, so we can easily read the least-significant next byte
       i32.const 0xFF
       i32.and)

 (func $sp
       (result i32)

       call $activeContext
       i32.const 2
       call $integerOfAt

       ;; decode the byte-offset stack pointer
       i32.const 5 ;; Squeak.Context_tempFrameStart - 1
       i32.add
       global.set $sp
       global.get $sp)

 (func $setSP
       (param $value i32)

       call $activeContext
       i32.const 2
       local.get $value
       global.set $sp
       global.get $sp
       i32.const 5 ;; Squeak.Context_tempFrameStart - 1
       i32.sub
       call $pointerOfAtPutInteger)

 (func $pushPointer
       (param $value i32)
       (local $newSP i32)
       
       call $activeContext
       call $sp
       i32.const 1
       i32.add
       local.set $newSP
       local.get $newSP
       local.get $value
       call $pointerOfAtPutPointer
       local.get $newSP
       call $setSP)

 (func $nil
       (result i32)

       i32.const 4)

 (func $isBlockContext
       (param $context (ref $object))
       (result i32)

       local.get $context
       call $load32BitInteger
       i32.const 12
       i32.shr_u
       i32.const 31
       i32.and
       i32.const 13
       i32.eq)
 
 (func $homeContextOf
       (param $context (ref $object))
       (result i32)
       (local $closureOrNil i32)
       
       local.get $context
       call $isBlockContext

       (if (result i32)
	   (then
	    local.get $context
	    i32.const 5
	    call $pointerOfAt
	    call $homeContextOf)
	   (else
	    ;; Not a block context; we're home.
	    local.get $context)))

 (func $homeContext
       (result i32)

       call $activeContext
       call $homeContextOf
       global.set $homeContext
       global.get $homeContext)

 (func $receiver
       (result i32)

       call $homeContext
       i32.const 5
       call $pointerOfAt
       global.set $receiver
       global.get $receiver)

 (func $methodGetLiteral
       (param $index i32)
       (result i32)

       call $method
       local.get $index
       i32.const 1
       i32.add ;; skip the method header literal
       call $pointerOfAt)

 (func $methodGetSelector
       (param $index i32)
       (result i32)

       local.get $index
       call $methodGetLiteral)

 (func $pop
       (result i32)
       (local $sp i32)
       (local $result i32)
       
       call $sp
       local.set $sp
       call $activeContext
       local.get $sp
       call $pointerOfAt
       local.set $result
       local.get $sp
       i32.const 1
       i32.sub
       call $setSP
       local.get $result)

 (func $decodeSmallInteger
       (param $pointer i32)
       (result i32)

       local.get $pointer
       i32.const 1
       i32.and
       (if (result i32)
	   (then
	    local.get $pointer
	    i32.const 1
	    i32.shr_s)
	   (else
	    local.get $pointer)))
 
 (func $top
       (result i32)

       call $activeContext
       call $sp
       call $pointerOfAt)
 
 (func $true
       (result i32)

       i32.const 20)
 
 (func $false
       (result i32)

       i32.const 12)

 (func $extendedPush
       (param $byte i32)
       (local $lobits i32)
       (local $switch i32)

       local.get $byte
       i32.const 63
       i32.and
       local.set $lobits
       local.get $byte
       i32.const 6
       i32.shr_u
       local.set $switch
       local.get $switch
       i32.eqz
       (if
	(then
	 call $receiver
	 local.get $lobits
	 call $pointerOfAt
	 call $pushPointer)
	(else
	 local.get $switch
	 i32.const 1
	 i32.eq
	 (if
	  (then
	   call $homeContext
	   i32.const 6 ;; Squeak.Context_tempFrameStart
	   local.get $lobits
	   i32.add
	   call $pointerOfAt
	   call $pushPointer)
	  (else
	   local.get $switch
	   i32.const 2
	   i32.eq
	   (if
	    (then
	     local.get $lobits
	     call $methodGetLiteral
	     call $pushPointer)
	    (else
	     local.get $switch
	     i32.const 3
	     i32.eq
	     (if
	      (then
	       local.get $lobits
	       call $methodGetLiteral
	       i32.const 1 ;; Squeak.Assn_value
	       call $pointerOfAt
	       call $pushPointer)
	      (else
	       unreachable)))))))))

 (func $extendedStore
       (param $byte i32)
       (local $lobits i32)
       (local $switch i32)
       (local $association i32)
       (local $receiver i32)

       local.get $byte
       i32.const 63
       i32.and
       local.set $lobits
       local.get $byte
       i32.const 6
       i32.shr_u
       local.set $switch
       local.get $switch
       i32.eqz
       (if
	(then
	 call $receiver
	 call $beDirty
	 call $receiver
	 local.get $lobits
	 call $top
	 call $pointerOfAtPutPointer)
	(else
	 local.get $switch
	 i32.const 1
	 i32.eq
	 (if
	  (then
	   call $homeContext
	   i32.const 6 ;; Squeak.Context_tempFrameStart
	   local.get $lobits
	   i32.add
	   call $top
	   call $pointerOfAtPutPointer)
	  (else
	   local.get $switch
	   i32.const 2
	   i32.eq
	   (if
	    (then
	     unreachable)
	    (else
	     local.get $switch
	     i32.const 3
	     i32.eq
	     (if
	      (then
	       local.get $lobits
	       call $methodGetLiteral
	       local.set $association
	       local.get $association
	       call $beDirty
	       local.get $association
	       i32.const 1 ;; Squeak.Assn_value
	       call $top
	       call $pointerOfAtPutPointer)
	      (else
	       unreachable)))))))))

 (func $extendedStorePop
       (param $byte i32)
       (local $lobits i32)
       (local $switch i32)
       (local $association i32)

       local.get $byte
       i32.const 63
       i32.and
       local.set $lobits
       local.get $byte
       i32.const 6
       i32.shr_u
       local.set $switch
       local.get $switch
       i32.eqz
       (if
	(then
	 call $receiver
	 call $beDirty
	 global.get $receiver
	 local.get $lobits
	 call $pop
	 call $pointerOfAtPutPointer)
	(else
	 local.get $switch
	 i32.const 1
	 i32.eq
	 (if
	  (then
	   call $homeContext
	   i32.const 6 ;; Squeak.Context_tempFrameStart
	   local.get $lobits
	   i32.add
	   call $pop
	   call $pointerOfAtPutPointer)
	  (else
	   local.get $switch
	   i32.const 2
	   i32.eq
	   (if
	    (then
	     unreachable)
	    (else
	     local.get $switch
	     i32.const 3
	     i32.eq
	     (if
	      (then
	       local.get $lobits
	       call $methodGetLiteral
	       local.set $association
	       local.get $association
	       call $beDirty
	       local.get $association
	       i32.const 1 ;; Squeak.Assn_value
	       call $top
	       call $pointerOfAtPutPointer)
	      (else
	       unreachable)))))))))

 (func $doubleExtendedDoAnything
       (param $secondByte i32)
       (local $thirdByte i32)
       (local $switch i32)
       (local $association i32)
       
       call $nextByte
       local.set $thirdByte
       local.get $secondByte
       i32.const 5
       i32.shr_u
       local.set $switch
       local.get $switch
       i32.eqz
       (if
	(then
	 local.get $thirdByte
	 call $methodGetSelector
	 local.get $secondByte
	 i32.const 31
	 i32.and
	 i32.const 0
	 call $send)
	(else
	 local.get $switch
	 i32.const 1
	 i32.eq
	 (if
	  (then
	   local.get $thirdByte
	   call $methodGetSelector
	   local.get $secondByte
	   i32.const 31
	   i32.add
	   i32.const 1
	   call $send)
	  (else
	   local.get $switch
	   i32.const 2
	   i32.eq
	   (if
	    (then
	     call $receiver
	     local.get $thirdByte
	     call $pointerOfAt
	     call $pushPointer)
	    (else
	     local.get $switch
	     i32.const 3
	     i32.eq
	     (if
	      (then
	       local.get $thirdByte
	       call $methodGetLiteral
	       call $pushPointer)
	      (else
	       local.get $switch
	       i32.const 4
	       i32.eq
	       (if
		(then
		 local.get $thirdByte
		 call $methodGetLiteral
		 i32.const 1 ;; Squeak.Assn_value
		 call $pointerOfAt
		 call $pushPointer)
		(else
		 local.get $switch
		 i32.const 5
		 i32.eq
		 (if
		  (then
		   call $receiver
		   call $beDirty
		   global.get $receiver
		   local.get $thirdByte
		   call $top
		   call $pointerOfAtPutPointer)
		  (else
		   local.get $switch
		   i32.const 6
		   i32.eq
		   (if
		    (then
		     call $receiver
		     call $beDirty
		     global.get $receiver
		     local.get $thirdByte
		     call $pop
		     call $pointerOfAtPutPointer)
		    (else
		     local.get $switch
		     i32.const 7
		     i32.eq
		     (if
		      (then
		       local.get $thirdByte
		       call $methodGetLiteral
		       local.set $association
		       local.get $association
		       call $beDirty
		       local.get $association
		       i32.const 1 ;; Squeak.Assn_value
		       call $top
		       call $pointerOfAtPutPointer)
		      (else
		       unreachable)))))))))))))))))

 (func $specialObjectAt
       (param $index i32)

       global.get $specialObjectsArray
       local.get $index
       array.get)

 (func $jumpIfFalse
       (param $delta i32)
       (local $top i32)

       call $pop
       local.set $top
       local.get $top
       call $false
       i32.eq
       (if
	(then
	 call $pc
	 local.get $delta
	 i32.add
	 call $setPC
	 return)
	(else
	 local.get $top
	 call $true
	 i32.eq
	 (if
	  (then
	   return)
	  (else
	   local.get $top
	   call $pushPointer
	   i32.const 25 ;; Squeak.splOb_SelectorMustBeBoolean
	   call $specialObjectAt
	   i32.const 0
	   i32.const 0
	   call $send)))))

 (func $jumpIfTrue
       (param $delta i32)
       (local $top i32)

       call $pop
       local.set $top
       local.get $top
       call $true
       i32.eq
       (if
	(then
	 call $pc
	 local.get $delta
	 i32.add
	 call $setPC
	 return)
	(else
	 local.get $top
	 call $false
	 i32.eq
	 (if
	  (then
	   return)
	  (else
	   local.get $top
	   call $pushPointer
	   i32.const 25 ;; Squeak.splOb_SelectorMustBeBoolean
	   call $specialObjectAt
	   i32.const 0
	   i32.const 0
	   call $send)))))

 (func $sendSpecial
       (param $lobits i32)
       (local $specialSelectors i32)
       (local $selectorAddress i32)
       
       i32.const 23 ;; Squeak.splOb_SpecialSelectors
       call $specialObjectAt
       local.set $specialSelectors
       local.get $specialSelectors
       local.get $lobits
       i32.const 2
       i32.mul
       call $pointerOfAt
       local.set $selectorAddress
       local.get $selectorAddress
       i32.const 1
       i32.and
       (if
	(then
	 unreachable))
       local.get $selectorAddress
       local.get $specialSelectors
       local.get $lobits
       i32.const 2
       i32.mul
       i32.const 1
       i32.add
       call $integerOfAt
       i32.const 0
       call $send)

 (func $stackValue
       (param $depthIntoStack i32)
       (result i32)

       call $activeContext
       global.get $sp
       local.get $depthIntoStack
       i32.sub
       call $pointerOfAt)

 (func $getClass
       (param $object (ref $object))
       (result i32)

       local.get $object
       ref.test $object

       (if (result i32)
	   (then
	    i32.const 5 ;; Squeak.splOb_ClassInteger
	    call $specialObjectAt)
	   (else
	    local.get $object
	    struct.get $object $class)))

 (func $methodNumLits
       (param $method (ref $object))
       (result i32)

       local.get $method
       i32.const 0
       call $pointerOfAt
       i32.const 9
       i32.shr_u
       i32.const 0xFF
       i32.and)

 (func $shouldForward
       (param $selector i32)
       (param $class i32)
       (result i32)

       local.get $class
       global.get $specialObjectsArray
       i32.const 107 ;; Squeak.splOb_ClassProxy
       call $pointerOfAt
       i32.ne

       (if (then
	    i32.const 0
	    return))

       local.get $selector
       global.get $specialObjectsArray
       i32.const 109 ;; Squeak.splOb_SelectorInitProxy
       call $pointerOfAt
       i32.eq

       (if (then
	    i32.const 0
	    return))

       local.get $selector
       global.get $specialObjectsArray
       i32.const 110 ;; Squeak.splOb_SelectorRecyclingHash
       call $pointerOfAt
       i32.eq

       (if (then
	    i32.const 0
	    return))

       local.get $selector
       global.get $specialObjectsArray
       i32.const 108 ;; Squeak.splOb_SelectorForward
       call $pointerOfAt
       i32.eq

       (if (then
	    i32.const 0
	    return))

       local.get $selector
       global.get $specialObjectsArray
       i32.const 112 ;; Squeak.splOb_SelectorIsNil
       call $pointerOfAt
       i32.eq

       (if (then
	    i32.const 0
	    return))

       local.get $selector
       global.get $specialObjectsArray
       i32.const 113 ;; Squeak.splOb_SelectorNextInstance
       call $pointerOfAt
       i32.eq

       (if (then
	    i32.const 0
	    return))

       local.get $selector
       global.get $specialObjectsArray
       i32.const 121 ;; Squeak.splOb_SelectorTether
       call $pointerOfAt
       i32.eq

       (if (then
	    i32.const 0
	    return))

       local.get $selector
       global.get $specialObjectsArray
       i32.const 111 ;; Squeak.splOb_SelectorCounterpart
       call $pointerOfAt
       i32.eq

       (if (then
	    i32.const 0
	    return))

       local.get $selector
       global.get $specialObjectsArray
       i32.const 114 ;; Squeak.splOb_SelectorStoreOnTether
       call $pointerOfAt
       i32.eq

       (if (then
	    i32.const 0
	    return))
       i32.const 1)
       
 (func $createActualMessage
       (param $selector i32)
       (param $numberOfParameters i32)
       (param $class i32)
       (result i32)
       (local $message i32)
       (local $parametersArray i32)

       global.get $specialObjectsArray
       i32.const 15 ;; Squeak.splOb_ClassMessage
       call $pointerOfAt
       i32.const 0
       i32.const 0
       call $instantiateClass
       local.set $message

       global.get $specialObjectsArray
       i32.const 7 ;; Squeak.splOb_ClassArray
       call $pointerOfAt
       local.get $numberOfParameters
       i32.const 0
       call $instantiateClass
       local.set $parametersArray

       global.get $activeContext
       call $pointersOf
       global.get $sp
       local.get $numberOfParameters
       i32.sub
       i32.const 1
       i32.add
       local.get $parametersArray
       call $pointersOf
       i32.const 0
       local.get $numberOfParameters
       call $arrayCopy ;; copy parameters from the stack

       local.get $message
       i32.const 0 ;; Squeak.Message_selector
       local.get $selector
       call $pointerOfAtPutPointer

       local.get $message
       i32.const 1 ;; Squeak.Message_arguments
       local.get $parametersArray
       call $pointerOfAtPutPointer

       local.get $message
       call $numberOfWordsOf
       i32.const 2 ;; Squeak.Message_lookupClass
       i32.gt_u

       (if (then
	    local.get $message
	    i32.const 2 ;; Squeak.Message_lookupClass
	    local.get $class
	    call $pointerOfAtPutPointer))

       local.get $message)

 (func $popNandPush
       (param $amountToPop i32)
       (param $object (ref $object))

       global.get $activeContext
       global.get $sp
       local.get $amountToPop
       i32.const 1
       i32.sub
       i32.sub
       global.set $sp
       global.get $sp
       local.get $object
       call $pointerOfAtPutPointer)
       
 (func $findMethodCacheEntry
       (param $selector i32)
       (param $lookupClass i32)
       (result i32)
       (local $entry i32)
       (local $firstProbe i32)
       (local $probe i32)
       (local $index i32)

       ;; Probe the cache, and return the matching entry if
       ;; found. Otherwise, return one that can be used (selector and
       ;; class set) with method == null. Initial probe is class xor
       ;; selector, reprobe delta is selector. We do not try to
       ;; optimize probe time -- all are equally 'fast' compared to
       ;; lookup. Instead, we randomize the reprobe so two or three
       ;; very active conflicting entries will not keep dislodging
       ;; each other.

       global.get $methodCacheRandomish
       i32.const 1
       i32.add
       i32.const 3
       i32.and
       global.set $methodCacheRandomish

       local.get $selector
       struct.get $object $hash
       local.get $lookupClass
       struct.get $object $hash
       i32.xor
       global.get $methodCacheMask
       i32.and
       local.set $firstProbe

       local.get $firstProbe
       local.set $probe

       i32.const 0
       local.set $index

       (loop $loop1
	     global.get $methodCache
	     local.get $probe
	     i32.add
	     call $load32BitInteger
	     local.set $entry

	     local.get $entry
	     call $methodCacheEntrySelector
	     local.get $selector
	     i32.eq

	     (if (then
		  local.get $entry
		  call $methodCacheEntryLookupClass
		  local.get $lookupClass
		  i32.eq

		  (if (then
		       local.get $entry
		       return))))

	     local.get $index
	     global.get $methodCacheRandomish
	     i32.eq

	     (if (then
		  local.get $probe
		  local.set $firstProbe))

	     local.get $probe
	     local.get $selector
	     struct.get $object $hash
	     i32.add
	     global.get $methodCacheMask
	     i32.and
	     local.set $probe

	     local.get $index
	     i32.const 1
	     i32.add
	     local.set $index
	     local.get $index
	     i32.const 4
	     i32.ge_u
           br_if $loop1)

       global.get $methodCache
       local.get $firstProbe
       i32.add
       call $load32BitInteger
       local.set $entry

       local.get $entry
       local.get $lookupClass
       call $setMethodCacheEntryLookupClass

       local.get $entry
       local.get $selector
       call $setMethodCacheEntrySelector

       local.get $entry
       i32.const 0
       call $setMethodCacheEntryMethod

       local.get $entry)

 (func $methodCacheEntryMethod
       (param $methodCacheEntry i32)
       (result i32)

       ;; offsets:
       ;; 0: lookup class
       ;; 4: selector
       ;; 8: number of parameters
       ;; 12: method
       ;; 16: mclass
       ;; 20: primitive index
       
       local.get $methodCacheEntry
       i32.const 12
       i32.add
       call $load32BitInteger)

 (func $superclass
       (param $class i32)
       (result i32)

       local.get $class
       i32.const 0
       call $pointerOfAt)

 (func $lookupSelectorInDict
       (param $mDict i32)
       (param $selector i32)
       (result i32)
       (local $dictSize i32)
       (local $mask i32)
       (local $index i32)
       (local $hasWrapped i32)
       (local $nextSelector i32)
       (local $methArray i32)

       ;; returns a method or nil
       local.get $mDict
       call $pointersSize
       local.set $dictSize

       local.get $dictSize
       i32.const 2 ;; Squeak.MethodDict_selectorStart
       i32.sub
       i32.const 1
       i32.sub
       local.set $mask

       local.get $mask
       local.get $selector
       struct.get $object $hash
       i32.and
       i32.const 2 ;; Squeak.MethodDict_selectorStart
       i32.add
       local.set $index

       ;; If there are no nils (should always be), then stop looping
       ;; on second wrap.
       i32.const 0
       local.set $hasWrapped

       (loop $loop1
	     local.get $mDict
	     local.get $index
	     call $pointerOfAt
	     local.set $nextSelector

	     local.get $nextSelector
	     local.get $selector
	     i32.eq

	     (if (then
		  local.get $mDict
		  i32.const 1 ;; Squeak.MethodDict_array
		  call $pointerOfAt
		  local.set $methArray

		  local.get $methArray
		  local.get $index
		  i32.const 2 ;; Squeak.MethodDict_selectorStart
		  i32.sub
		  call $pointerOfAt
		  return))

	     local.get $nextSelector
	     call $isNil

	     (if (then
		  global.get $nilObj
		  return))

	     local.get $index
	     i32.const 1
	     i32.add
	     local.set $index
	     local.get $index
	     local.get $dictSize
	     i32.eq

	     (if (then
		  local.get $hasWrapped

		  (if (then
		       global.get $nilObj
		       return))

		  i32.const 2 ;; Squeak.MethodDict_selectorStart
		  local.set $index
		  i32.const 1
		  local.set $hasWrapped))

	     i32.const 1
	     br_if $loop1)
       unreachable)
       
 (func $setMethodCacheEntryMethod
       (param $methodCacheEntry i32)
       (param $method (ref $object))

       local.get $methodCacheEntry
       i32.const 8
       i32.add
       local.get $method
       call $store32BitInteger)
       
 (func $setMethodCacheEntryNumberOfParameters
       (param $methodCacheEntry i32)
       (param $numberOfParameters i32)

       local.get $methodCacheEntry
       i32.const 8
       i32.add
       local.get $numberOfParameters
       call $store32BitInteger)

 (func $setMethodCacheEntryMClass
       (param $methodCacheEntry i32)
       (param $class i32)

       local.get $methodCacheEntry
       i32.const 16
       i32.add
       local.get $class
       call $store32BitInteger)

 (func $methodCacheEntryPrimIndex
       (param $methodCacheEntry i32)
       (result i32)

       local.get $methodCacheEntry
       i32.const 20
       i32.add
       call $load32BitInteger)
       
 (func $methodClassForSuper
       (param $object (ref $object))
       (result i32)
       (local $association i32)

       ;; association found in last literal
       local.get $object
       local.get $object
       call $methodNumLits
       call $pointerOfAt
       local.set $association
       local.get $association
       i32.const 1 ;; Squeak.Assn_value
       call $pointerOfAt)

 (func $isMethod
       (param $object (ref $object))
       (result i32)

       local.get $object
       call $formatOf
       i32.const 12
       i32.ge_u)
       
 (func $setMethodCacheEntryPrimIndex
       (param $methodCacheEntry i32)
       (param $primitiveIndex i32)

       local.get $methodCacheEntry
       i32.const 20
       i32.add
       local.get $primitiveIndex
       call $store32BitInteger)
       
 (func $findSelectorInClass
       (param $selector i32)
       (param $numberOfParameters i32)
       (param $startingClass i32)
       (result i32)
       (local $message i32)
       (local $methodCacheEntry i32)
       (local $currentSelector i32)
       (local $currentClass i32)
       (local $currentLookupClass i32)
       (local $mDict i32)
       (local $cannotInterpretSelector i32)
       (local $cannotInterpretMessage i32)
       (local $newMethod i32)
       (local $doesNotUnderstandSelector i32)
       (local $doesNotUnderstandMessage i32)
       
       local.get $selector
       local.get $startingClass
       call $shouldForward

       (if (result i32)
	(then
	 local.get $selector
	 local.get $numberOfParameters
	 local.get $startingClass
	 call $createActualMessage
	 local.set $message

	 local.get $numberOfParameters
	 local.get $message
	 call $popNandPush

	 global.get $specialObjectsArray
	 i32.const 108 ;; Squeak.splOb_SelectorForward
	 call $pointerOfAt
	 i32.const 0
	 i32.const 0
	 call $findSelectorInClass
	 return)

	(else
	 local.get $selector
	 local.get $startingClass
	 call $findMethodCacheEntry
	 local.set $methodCacheEntry

	 local.get $methodCacheEntry
	 call $methodCacheEntryMethod

	 (if (result i32)
	  (then
	   local.get $methodCacheEntry
	   return)

	  (else
	   local.get $startingClass
	   local.set $currentClass

	   (loop $loop1
		 local.get $currentClass
		 i32.const 1 ;; Squeak.Class_mdict
		 call $pointerOfAt
		 local.set $mDict

		 local.get $mDict
		 call $isNil

		 (if
		  (then
		   ;;  MethodDict pointer is nil (hopefully due a
		   ;;  swapped out stub). Send #cannotInterpret:

		   global.get $specialObjectsArray
		   i32.const 34 ;; Squeak.splOb_SelectorCannotInterpret
		   call $pointerOfAt
		   local.set $cannotInterpretSelector

		   local.get $selector
		   local.get $numberOfParameters
		   local.get $startingClass
		   call $createActualMessage
		   local.set $cannotInterpretMessage

		   local.get $numberOfParameters
		   local.get $cannotInterpretMessage
		   call $popNandPush

		   local.get $cannotInterpretSelector
		   i32.const 1
		   local.get $currentClass
		   call $superclass
		   call $findSelectorInClass
		   return)

		  (else
		   local.get $mDict
		   local.get $selector
		   call $lookupSelectorInDict
		   local.set $newMethod

		   local.get $newMethod
		   call $isNil
		   i32.eqz

		   (if
		    (then
		     local.get $selector
		     local.set $currentSelector

		     local.get $startingClass
		     local.set $currentLookupClass

		     ;; If method is not actually a CompiledMethod, invoke
		     ;; primitiveInvokeObjectAsMethod (248) instead.
		     local.get $methodCacheEntry
		     local.get $newMethod
		     call $setMethodCacheEntryMethod

		     local.get $methodCacheEntry
		     local.get $newMethod
		     call $isMethod
		     
		     (if (result i32)
			 (then
			  local.get $newMethod
			  call $methodPrimitiveIndex)
			 (else
			  i32.const 248))
		     
		     call $setMethodCacheEntryPrimIndex

		     local.get $methodCacheEntry
		     local.get $numberOfParameters
		     call $setMethodCacheEntryNumberOfParameters

		     local.get $methodCacheEntry
		     local.get $currentClass
		     call $setMethodCacheEntryMClass

		     local.get $methodCacheEntry
		     return)

		    (else
		     local.get $currentClass
		     call $superclass
		     local.set $currentClass

		     local.get $currentClass
		     call $isNil
		     br_if $loop1)))))
	   
	   ;; Cound not find a normal message -- send
	   ;; #doesNotUnderstand:
	   global.get $specialObjectsArray
	   i32.const 20 ;; Squeak.splOb_SelectorDoesNotUnderstand
	   call $pointerOfAt
	   local.set $doesNotUnderstandSelector
	   local.get $selector
	   local.get $doesNotUnderstandSelector
	   i32.eq

	   (if
	    (then
	     unreachable))

	   local.get $selector
	   local.get $numberOfParameters
	   local.get $startingClass
	   call $createActualMessage
	   local.set $doesNotUnderstandMessage
	   local.get $numberOfParameters
	   local.get $doesNotUnderstandMessage
	   call $popNandPush
	   local.get $doesNotUnderstandSelector
	   i32.const 1
	   local.get $startingClass
	   call $findSelectorInClass)))))

 (func $methodCacheEntryNumberOfParameters
       (param $methodCacheEntry i32)
       (result i32)

       local.get $methodCacheEntry
       i32.const 8
       i32.add
       call $load32BitInteger)
       
 (func $methodCacheEntryMClass
       (param $methodCacheEntry i32)
       (result i32)

       local.get $methodCacheEntry
       i32.const 16
       i32.add
       call $load32BitInteger)
       
 (func $executeNewMethod
       (param $newReceiver i32)
       (param $newMethod i32)
       (param $numberOfParameters i32)
       (param $primitiveIndex i32)
       (param $optionalClass i32)
       (param $optionalSelector i32))
 
 (func $send
       (param $selector i32)
       (param $numberOfParameters i32)
       (param $doSuper i32)
       (local $newReceiver i32)
       (local $lookupClass i32)
       (local $methodCacheEntry i32)

       local.get $numberOfParameters
       call $stackValue
       local.set $newReceiver
       local.get $newReceiver
       call $getClass
       local.set $lookupClass
       local.get $doSuper

       (if
	(then
	 global.get $method
	 call $methodClassForSuper
	 local.set $lookupClass
	 local.get $lookupClass
	 i32.const 0 ;; Squeak.Class_superclass
	 call $pointerOfAt
	 local.set $lookupClass))

       local.get $selector
       local.get $numberOfParameters
       local.get $lookupClass
       call $findSelectorInClass
       local.set $methodCacheEntry
       local.get $methodCacheEntry
       call $methodCacheEntryPrimIndex

       (if
	(then
	 ;; note details for verification of at/atput primitives
	 local.get $selector
	 global.set $verifyAtSelector
	 local.get $lookupClass
	 global.set $verifyAtClass))

       local.get $newReceiver
       local.get $methodCacheEntry
       call $methodCacheEntryMethod
       local.get $methodCacheEntry
       call $methodCacheEntryNumberOfParameters
       local.get $methodCacheEntry
       call $methodCacheEntryPrimIndex
       local.get $methodCacheEntry
       call $methodCacheEntryMClass
       local.get $selector
       call $executeNewMethod)

 (func $registerObject
       (param $object (ref $object))
       (result i32)

       ;; oop is determined by instantiateClass()
       i32.const 13849
       i32.const 27181
       global.get $lastHash
       i32.mul
       i32.add
       i32.const 0xFFFFFFFF
       i32.and
       global.set $lastHash

       global.get $lastHash
       i32.const 0xFFF
       i32.and)
       
 (func $setHasNewInstancesAt
       (param $class i32)

       local.get $class
       i32.const 10
       call $setMetabitOfAt)

 (func $initializeBytesOf
       (param $object (ref $object))

       ;; For now, assume that each new object will fit in 64
       ;; words. Ultimately, ensure that a new object uses a minimal
       ;; number of bytes, and that the address of the next available
       ;; byte is recorded appropriately.
)       
       
 (func $fillArrayOf
       (param $object (ref $object))
       (param $quantity i32)
       (param $value i32)
       (local $index i32)

       local.get $quantity
       i32.const 0
       i32.le_s
       (if (then return))
       
       i32.const 0
       local.set $index

       (loop $loop1
	     local.get $object
	     local.get $index
	     local.get $value
	     call $pointerOfAtPutPointer

	     local.get $index
	     i32.const 1
	     i32.add
	     local.get $quantity
	     i32.ge_u
	     br_if $loop1))

 (func $initializeWordsOf
       (param $object (ref $object))

       ;; For now, assume that each new object will fit in 64
       ;; words. Ultimately, ensure that a new object uses a minimal
       ;; number of words, and that the address of the next available
       ;; byte is recorded appropriately.
       )
 
 (func $initInstanceOf
       (param $object (ref $object))
       (param $class i32)
       (param $indexableSize i32)
       (param $hash i32)
       (param $nilObj i32)
       (local $instSpec i32)
       (local $instSize i32)

       local.get $object
       local.get $class
       struct.set $object $class

       local.get $object
       local.get $hash
       struct.set $object $hash

       local.get $class
       call $instanceSpecificationFrom
       local.set $instSpec

       local.get $instSpec
       i32.const 1
       i32.shr_u
       i32.const 0x3F
       i32.and
       local.get $instSpec
       i32.const 10
       i32.shr_u
       i32.const 0xC0
       i32.and
       i32.add
       i32.const 1
       i32.sub
       local.set $instSize

       local.get $object
       local.get $class
       call $formatPrescribedBy
       call $formatOfPut

       local.get $class
       call $prescribesBytes

       (if
	(then
	 ;; bytes
	 local.get $indexableSize
	 i32.const 0
	 i32.gt_u

	 (if (then
	      local.get $object
	      local.get $object
	      call $formatOf
	      i32.const 0
	      local.get $indexableSize
	      i32.sub
	      i32.const 3
	      i32.and
	      i32.or
	      call $formatOfPut
	      
	      local.get $object
	      local.get $indexableSize
	      call $initializeBytesOf
	      return)))
	(else
	 local.get $class
	 call $prescribesPointers

	 (if
	  (then
	   ;; pointers
	   local.get $instSize
	   local.get $indexableSize
	   i32.add
	   i32.const 0
	   i32.gt_u

	   (if (then
		local.get $object
		local.get $instSize
		local.get $indexableSize
		i32.add
		local.get $nilObj
		call $fillArrayOf
		return)))
	  (else
	   ;; words
	   local.get $indexableSize
	   i32.const 0
	   i32.gt_u

	   (if (then
		local.get $class
		call $isFloatClass

		(if
		 (then
		  local.get $object
		  call $isFloat

		  local.get $object
 		  f32.const 0
		  struct.set $object $float)
		 (else
		  local.get $object
		  local.get $indexableSize
		  call $initializeWordsOf
		  return)))))))))
	 
 (func $new
       (param $class i32)
       (param $indexableSize i32)
       (result i32)
       (local $oop i32)
	      
       ;; Create new entries in the young objects segment and table.
       global.get $youngObjectsCount
       i32.const 1
       i32.add
       global.set $youngObjectsCount
       
       ;; Calculate the address of the new object.
       global.get $youngObjectsCount
       i32.const 256
       i32.mul
       global.get $youngObjectsSegment
       i32.add
       local.set $oop
       
       ;; Write the new object's address to the young objects table.
       global.get $youngObjectsCount
       i32.const 4
       i32.mul
       global.get $youngObjectsTable
       i32.add
       local.get $oop
       call $store32BitInteger

       local.get $oop)
       
 (func $instantiateClass
       (param $class i32)
       (param $indexableSize i32)
       (param $filler i32)
       (result i32)
       (local $newObject i32)
       (local $hash i32)

       local.get $class
       local.get $indexableSize
       call $new
       local.set $newObject

       local.get $newObject
       call $registerObject
       local.set $hash

       local.get $newObject
       local.get $class
       local.get $indexableSize
       local.get $hash
       local.get $filler
       call $initInstanceOf

       local.get $class
       call $setHasNewInstancesAt

       local.get $newObject)
       
 (func $pointersOf
       (param $object (ref $object))
       (result i32)

       local.get $object
       struct.get $object $pointers)
       
 (func $arrayCopy
       (param $src i32)
       (param $srcPos i32)
       (param $dest i32)
       (param $destPos i32)
       (param $length i32)
       (local $index i32)
       
       local.get $src
       local.get $dest
       i32.eq
       i32.const 1
       i32.eq
       local.get $srcPos
       local.get $destPos
       i32.lt_u
       i32.eq

       (if
	(then
	 local.get $length
	 i32.const 1
	 i32.sub
	 local.set $index

	 local.get $index
	 i32.const 0
	 i32.ge_u

	 (if (then
	      (loop $loop1
		    local.get $dest
		    local.get $destPos
		    i32.add
		    local.get $index
		    i32.add
		    local.get $src
		    local.get $srcPos
		    i32.add
		    local.get $index
		    i32.add
		    call $load32BitInteger
		    call $store32BitInteger

		    local.get $index
		    i32.const 1
		    i32.sub
		    local.set $index
		 
		    local.get $index
		    i32.const 0
		    i32.lt_u
		    br_if $loop1))))
	(else
	 i32.const 0
	 local.set $index
	 local.get $index
	 local.get $length
	 i32.lt_u
	 
	 (if (then
	      (loop $loop2
		    local.get $dest
		    local.get $destPos
		    i32.add
		    i32.const 1
		    i32.add
		    local.get $src
		    local.get $srcPos
		    i32.add
		    i32.const 1
		    i32.add
		    call $load32BitInteger
		    call $store32BitInteger

		    local.get $index
		    i32.const 1
		    i32.add
		    local.set $index

		    local.get $index
		    local.get $length
		    i32.ge_u
		    br_if $loop2))))))
       
 (func $methodCacheEntrySelector
       (param $methodCacheEntry i32)
       (result i32)

       local.get $methodCacheEntry
       i32.const 4
       i32.add
       call $load32BitInteger)
       
 (func $methodCacheEntryLookupClass
       (param $methodCacheEntry i32)
       (result i32)

       local.get $methodCacheEntry
       call $load32BitInteger)
       
 (func $setMethodCacheEntryLookupClass
       (param $methodCacheEntry i32)
       (param $class i32)

       local.get $methodCacheEntry
       local.get $class
       call $store32BitInteger)
       
 (func $setMethodCacheEntrySelector
       (param $methodCacheEntry i32)
       (param $selector i32)

       local.get $methodCacheEntry
       i32.const 4
       i32.add
       local.get $selector
       call $store32BitInteger)

 (func $formatOfPut
       (param $object (ref $object))
       (param $format i32)
       (local $header i32)

       local.get $object
       local.get $object
       call $load32BitInteger
       local.set $header
       i32.const 8
       i32.shr_u
       i32.const 0xFFFFF0
       i32.and
       local.get $format
       i32.or
       i32.const 8
       i32.shl
       local.get $header
       i32.const 0xFF
       i32.add
       call $store32BitInteger)

 (func $instanceSpecificationFrom
      (param $class i32)
      (result i32)
      
      local.get $class
      i32.const 2 ;; Squeak.Class_format
      call $pointerOfAt)
 
 (func $formatPrescribedBy
       (param $class i32)
       (result i32)

       local.get $class
       call $instanceSpecificationFrom
       i32.const 7
       i32.shr_u
       i32.const 0xF
       i32.and)       

 (func $prescribesPointers
       (param $class i32)
       (result i32)
       (local $format i32)

       local.get $class
       call $formatPrescribedBy
       local.set $format
       local.get $format
       i32.const 8
       i32.lt_u
       local.get $format
       i32.const 6
       i32.ne
       i32.and)
 
 (func $prescribesWords
       (param $class i32)
       (result i32)
       (local $format i32)

       local.get $class
       call $formatPrescribedBy
       i32.const 6
       i32.eq)
 
 (func $prescribesBytes
       (param $class i32)
       (result i32)
       (local $format i32)

       local.get $class
       call $formatPrescribedBy
       i32.const 8
       i32.ge_u)
 
 (func $formatOf
       (param $object (ref $object))
       (result i32)

       local.get $object
       call $load32BitInteger
       i32.const 8
       i32.shr_u
       i32.const 15
       i32.and)

 (func $popNandPushIfOK
       (param $bool i32)
       (result i32)

       local.get $bool
       call $pop2AndPushBoolResult)

 (func $checkNonInteger
       (param $object (ref $object))
       (result i32)

       local.get $object
       i32.const 1
       i32.and
       i32.eqz

       (if (then
	    local.get $object
	    return))

       call $beUnsuccessful
       global.get $nilObj)

 (func $isNumber
       (param $object (ref $object))
       (result i32)

       local.get $object
       
       call $load32BitInteger
       i32.const 1
       i32.and)

 (func $isA
       (param $object (ref $object))
       (param $knownClass i32)
       (local $classOrSuper i32)
       (local $class i32)

       local.get $object
       struct $object $class
       local.set $classOrSuper

       local.get $knownClass
       call $specialObjectAt
       local.set $class

       (loop $loop1
	     local.get $classOrSuper
	     local.get $class
	     i32.eq
	     (if (then
		  i32.const 1
		  return))

	     local.get $classOrSuper
	     i32.const 0 ;; Squeak.Class_superclass
	     call $pointerOfAt
	     local.set $classOrSuper

	     local.get $classOrSuper
	     call $isNil
	     i32.const 0
	     i32.ne
	     br_if $loop1)

       i32.const 0)

 (func $bytesSize
       (param $object (ref $object))
       (result i32)

       local.get $object
       call $wordsSize
       i32.const 4
       i32.mul)
 
 (func $wordsSize
       (param $object (ref $object))
       (result i32)
       (local $numberOfHeaderWords i32)

       local.get $object
       call $numberOfWordsOf
       local.set $numberOfHeaderWords

       local.get $numberOfHeaderWords
       i32.const 1
       i32.eq
       (if (then
	    local.get $object
	    call $load32BitInteger
	    i32.const 2
	    i32.shr_u
	    i32.const 63
	    i32.and
	    return))

       local.get $numberOfHeaderWords
       i32.const 2
       i32.eq
       (if (then
	    local.get $object
	    i32.const 4
	    i32.add
	    call $load32BitInteger
	    i32.const 2
	    i32.shr_u
	    i32.const 63
	    i32.and
	    return))

       local.get $object
       call $load32BitInteger
       i32.const 2
       i32.shr_u)

 (func $byteOfAt
       (param $object (ref $object))
       (param $index i32)
       (result i32)

       local.get $object
       struct.get $object $bytes
       local.get $index
       array.get)
       
 (func $positive32BitValueOf
       (param $object (ref $object))
       (result i32)
       (local $bytes (ref $bytes))
       (local $value i32)
       (local $index i32)
       (local $f i32)
       
       local.get $object
       call $isInteger
       (if (then
	    local.get $object
	    struct.get $object $integer
	    i32.const 0
	    i32.ge_s
	    (if (then
		 local.get $object
		 return))
	    call $beUnsuccessful
	    i32.const 0
	    return))

       local.get $object
       i32.const 13 ;; Squeak.splOb_ClassLargePositiveInteger
       call $isA
       i32.eqz
       local.get $object
       call $bytesSize
       i32.const 4
       i32.ne
       i32.or
       (if (then
	    call $beUnsuccessful
	    i32.const 0
	    return))

       local.get $object
       struct.get $object $bytes
       local.set $bytes

       i32.const 0
       local.set $value

       i32.const 0
       local.set $index

       i32.const 1
       local.set $f

       (loop $loop1
	     local.get $value
	     local.get $object
	     local.get $index
	     call $byteOfAt
	     local.get $f
	     i32.mul
	     i32.add
	     local.set $value

	     local.get $index
	     i32.const 1
	     i32.add
	     local.set $index

	     local.get $f
	     i32.const 256
	     i32.mul
	     local.set $f

	     local.get $index
	     i32.const 4
	     i32.ge_u
	     br_if $loop1)

       local.get $value)
       
 (func $stackPos32BitInt
       (param $depth i32)
       (result i32)

       local.get $depth
       call $stackValue
       call $positive32BitValueOf)
       
 (func $stackNonInteger
       (param $depth i32)
       (result i32)

       local.get $depth
       call $stackValue
       call $checkNonInteger)

 (func $objectAtPut
       (param $cameFromInstruction i32)
       (param $convertChars i32)
       (param $includeInstVars i32)
       (result i32)
       (local $array i32)
       (local $index i32)
       (local $info i32)
       (local $wordToPut i32)
       (local $floatData i32)
       (local $objToPut i32)

       ;; Returns result of at:put: or sets success false
       
       i32.const 2
       call $stackNonInteger
       local.set $array

       ;; note non-int returns zero
       i32.const 1
       call $stackPos32BitInt
       local.set $index

       global.get $success
       i32.eqz
       (if (then
	    local.get $array
	    return))

       local.get $cameFromInstruction
       (if
	(then
	 ;; fast entry checks cache
	 local.get $array
	 struct.get $object $hash
	 global.get $atCacheMask
	 i32.and
	 array.get $array
	 local.set $info

	 local.get $info
	 i32.const 0 ;; info.array offset is 0
	 local.get $array
	 i32.eq
	 i32.eqz
	 (if (then
	      call $beUnsuccessful
	      local.get $array
	      return)))
	(else
	 ;; slow entry installs in cache if appropriate
	 local.get $array
	 call $isFloat
	 (if (then
	      ;; present float as word array
	      i32.const 0
	      call $stackPos32BitInt
	      local.set $wordToPut

	      global.get $success
	      local.get $index
	      i32.const 1
	      i32.eq
	      local.get $index
	      i32.const 2
	      i32.eq
	      i32.or
	      i32.and
	      (if
	       (then
		local.get $array
		call $floatData
		local.set $floatData

		local.get $floatData
		local.get $index
		i32.const 1
		i32.eq
		(if
		 (then
		  i32.const 0)
		 (else
		  i32.const 4))
		local.get $wordToPut
		i32.const 0
		call $setUint32

		local.get $array
		local.get $floatData
		i32.const 0
		call $getFloat64
		struct.set $object $float)
	       (else
		call $beUnsuccessful))

	      i32.const 0
	      call $stackValue
	      return))

	     global.get $atPutCache
	     i32.const 34
	     call $specialSelectorsAt
	     local.get $array
	     local.get $convertChars
	     local.get $includeInstVars
	     call $makeAtCacheInfo
	     local.set $info))

       local.get $index
       i32.const 1
       i32.lt_u
       local.get $index
       local.get $info
       i32.const 4 ;; info.size offset is 4
       call $load32BitInteger
       i32.gt_u
       i32.or
       (if (then
	    call $beUnsuccessful
	    local.get $array
	    return))

       i32.const 0
       call $stackValue
       local.set $objToPut

       local.get $includeInstVars
       (if (then
	    ;; pointers...   instVarAtPut and objectAtPut
	    local.get $array
	    call $beDirty

	    local.get $array
	    local.get $index
	    i32.const 1
	    i32.sub
	    local.get $objToPut
	    ;; eg, objectAt:
	    call $pointerOfAtPutPointer

	    local.get $objToPut
	    return))

       local.get $array
       call $hasPointers
       (if (then
	    ;; pointers...   normal atPut
	    local.get $array
	    call $beDirty

	    local.get $array
	    local.get $index
	    i32.const 1
	    i32.sub
	    local.get $info
	    i32.const 8 ;; info.ivarOffset offset is 8
	    i32.add
	    call $load32BitInteger
	    local.get $objToPut
	    call $pointerOfAtPutPointer

	    local.get $objToPut
	    return))

       local.get $array
       call $hasWords
       (if (then
	    local.get $convertChars
	    (if
	     (then
	      ;; put a character...
	      local.get $objToPut
	      struct.get $object $class
	      i32.const 19 ;; Squeak.splOb_ClassCharacter
	      call $specialObjectAt
	      i32.eq
	      i32.eqz
	      (if (then
		   call $beUnsuccessful
		   local.get $objToPut
		   return))

	      local.get $objToPut
	      call $charToInt
	      local.set $intToPut

	      local.get $intToPut
	      call $isNumber
	      i32.eqz
	      (if (then
		   call $beUnsuccessful
		   local.get $objToPut
		   return)))
	     (else
	      i32.const 0
	      call $stackPos32BitInt
	      local.set $intToPut))

	    global.get $success
	    (if (then
		 local.get $array
		 local.get $index
		 i32.const 1
		 i32.sub
		 local.get $intToPut
		 call $wordOfAtPut))

	    local.get $objToPut))

       ;; bytes...
       local.get $convertChars
       (if
	(then
	 ;; put a character...
	 local.get $objToPut
	 struct.get $object $class
	 i32.const 19 ;; Squeak.splOb_ClassCharacter
	 call $specialObjectAt
	 i32.eq
	 i32.eqz
	 (if (then
	      call $beUnsuccessful
	      local.get $objToPut
	      return))

	 local.get $objToPut
	 call $charToInt
	 local.set $intToPut
	 local.get $intToPut
	 call $isNumber
	 i32.eqz
	 (if (then
	      call $beUnsuccessful
	      local.get $objToPut
	      return)))
	(else
	 ;; put a byte...
	 local.get $objToPut
	 call $isNumber
	 i32.eqz
	 (if (then
	      call $beUnsuccessful
	      local.get $objToPut
	      return))

	 local.get $objToPut
	 local.set $intToPut))

       local.get $intToPut
       i32.const 0
       i32.lt_s
       local.get $intToPut
       i32.const 255
       i32.gt_s
       i32.or
       (if (then
	    call $beUnsuccessful
	    local.get $intToPut
	    return))

       local.get $array
       call $hasBytes
       (if (then
	    ;; bytes...
	    local.get $array
	    local.get $index
	    i32.const 1
	    i32.sub
	    local.get $intToPut
	    call $byteOfAtPut

	    local.get $intToPut
	    return))

       ;; methods must simulate Squeak's method indexing
       local.get $array
       call $pointersSize
       i32.const 4
       i32.mul
       local.set $offset

       local.get $index
       i32.const 1
       i32.sub
       local.get $offset
       i32.sub
       i32.const 0
       i32.lt_s
       (if (then
	    ;; writing lits as bytes
	    call $beUnsuccessful
	    local.get $array
	    return))

       local.get $array
       local.get $index
       i32.const 1
       i32.sub
       local.get $offset
       i32.sub
       local.get $intToPut
       call $bytesOfAtPut

       local.get $objToPut
       return)
       
 (func $quickSendOther
       (param $receiver i32)
       (param $lobits i32)
       (result i32)

       ;; return true if successful
       call $beSuccessful
       
       local.get $lobits
       i32.eqz

       (if (then
	    ;; at:
	    i32.const 2
	    local.get $receiver
	    i32.const 1
	    i32.const 1
	    i32.const 0
	    call $objectAt
	    call $popNandPushIfOK
	    return))

       local.get $lobits
       i32.const 1
       i32.eq

       (if (then
	    ;; at:put:
	    i32.const 3
	    local.get $receiver
	    i32.const 1
	    i32.const 1
	    i32.const 0
	    call $objectAtPut
	    call $popNandPushIfOK
	    return))

       local.get $lobits
       i32.const 2
       i32.eq

       (if (then
	    ;; size
	    i32.const 1
	    local.get $receiver
	    i32.const 1
	    call $objectSize
	    call $popNandPushIfOK
	    return))

       local.get $lobits
       i32.const 6
       i32.eq

       (if (then
	    ;; ==
	    i32.const 1
	    call $stackValue
	    i32.const 0
	    call $stackValue
	    i32.eq
	    call $pop2AndPushBoolIfOK
	    return))

       local.get $lobits
       i32.const 7
       i32.eq
       
       (if (then
	    ;; class
	    i32.const 1
	    call $top
	    call $getClass
	    call $popNandPushIfOK
	    return))

       local.get $lobits
       i32.const 8
       i32.eq

       (if (then
	    ;; blockCopy:
	    i32.const 2
	    call $doBlockCopy
	    call $popNandPushIfOK
	    return))

       local.get $lobits
       i32.const 9
       i32.eq

       (if (then
	    ;; value
	    i32.const 0
	    call $primitiveBlockValue
	    return))

       local.get $lobits
       i32.const 0xA
       i32.eq

       (if (then
	    ;; value:
	    i32.const 1
	    call $primitiveBlockValue
	    return))

       i32.const 0)

 (func $primitiveMakePoint
       (param $argCount i32)
       (param $checkNumbers i32)
       (result i32)
       (local $x i32)
       (local $y i32)

       i32.const 1
       call $stackValue
       local.set $x

       i32.const 0
       call $stackValue
       local.set $y

       local.get $checkNumbers
       (if (then
	    local.get $x
	    call $checkFloat

	    local.get $y
	    call $checkFloat

	    global.get $success
	    i32.eqz
	    (if (then return))))

       local.get $argCount
       i32.const 1
       i32.add
       local.get $x
       local.get $y
       call $makePointWithXandY
       call $popNandPush

       i32.const 1)

 (func $pushClosureCopy
       (local $numArgsNumCopied i32)
       (local $numArgs i32)
       (local $numCopied i32)
       (local $blockSizeHigh i32)
       (local $blockSize i32)
       (local $initialPC i32)
       (local $closure i32)
       (local $index i32)

       ;; The compiler has pushed the values to be copied, if any.
       ;; Find numArgs and numCopied in the byte following.  Create a
       ;; Closure with space for the copiedValues and pop numCopied
       ;; values off the stack into the closure.  Set numArgs as
       ;; specified, and set startpc to the pc following the block
       ;; size and jump over that code.

       call $nextByte
       local.set $numArgsNumCopied

       local.get $numArgsNumCopied
       i32.const 0xF
       i32.and
       local.set $numArgs

       local.get $numArgsNumCopied
       i32.const 4
       i32.shr_u
       local.set $numCopied

       call $nextByte
       local.set $blockSizeHigh

       local.get $blockSizeHigh
       i32.const 256
       i32.mul
       call $nextByte
       i32.add
       local.set $blockSize

       global.get $pc
       global.get $method
       call $encodeSqueakPC
       local.set $initialPC

       local.get $numArgs
       local.get $initialPC
       local.get $numCopied
       call $newClosure
       local.set $closure

       local.get $closure
       i32.const 0 ;; Squeak.Closure_outerContext
       global.get $activeContext
       call $pointerOfAtPutPointer

       ;; The closure refers to thisContext so it can't be reclaimed.
       i32.const 0
       global.set $reclaimableContextCount

       local.get $numCopied
       i32.const 0
       i32.gt_u

       (if (then
	    i32.const 0
	    local.set $index

	    (loop $loop1
		  local.get $closure
		  i32.const 3 ;; Squeak.Closure_firstCopiedValue
		  local.get $index
		  i32.add
		  local.get $numCopied
		  local.get $index
		  i32.sub
		  i32.const 1
		  i32.sub
		  call $stackValue
		  call $pointerOfAtPutPointer

		  local.get $index
		  i32.const 0
		  i32.add
		  local.set $index
		  local.get $index
		  local.get $numCopied
		  i32.ge_u
		  br_if $loop1)
		  
	    local.get $numCopied
	    call $popN))

       global.get $pc
       local.get $blockSize
       i32.add
       global.set $pc

       local.get $closure
       call $push)

 (func $pushNewArray
       (param $nextByte i32)
       (local $count i32)
       (local $array i32)
       (local $index i32)

       local.get $nextByte
       i32.const 127
       i32.and
       local.set $count

       i32.const 7 ;; Squeak.splOb_ClassArray
       call $specialObjectAt
       local.get $count
       call $instantiateClass
       local.set $array

       local.get $nextByte
       i32.const 127
       i32.gt_u

       (if (then
	    i32.const 0
	    local.set $index
	    local.get $index
	    local.get $count
	    i32.lt_u

	    (if (then
		 (loop $loop1
		       local.get $array
		       local.get $index
		       local.get $count
		       local.get $index
		       i32.sub
		       i32.const 1
		       i32.sub
		       call $stackValue
		       call $pointersOfAtPutPointer

		       local.get $index
		       i32.const 1
		       i32.add
		       local.set $index
		       local.get $index
		       local.get $count
		       i32.ge_u
		       br_if $loop1)))

	    local.get $count
	    call $popN))

       local.get $array
       call $push)

 (func $push
       (param $object (ref $object))

       global.get $activeContext
       global.get $sp
       i32.const 1
       i32.add
       global.set $sp
       global.get $sp
       local.get $object
       call $pointerOfAtPutPointer)

 (func $pop2AndPushIntResult
       (param $intResult i32)
       (result i32)
       
       ;; answer success indicator
       global.get $success
       local.get $intResult
       call $canBeSmallInt
       i32.and

       (if (then
	    i32.const 2
	    local.get $intResult
	    call $popNandPush
	    i32.const 1))

       i32.const 0)

 (func $div
       (param $receiver i32)
       (param $argument i32)
       (result i32)

       local.get $argument
       i32.eqz

       (if (then
	    ;; fail if dividing by zero
	    i32.const -0x50000000
	    return))

       local.get $receiver
       local.get $argument
       i32.div_s
       f32.floor)
       
 (func $quickDivide
       (param $receiver i32)
       (param $argument i32)
       (result i32)
       (local $result i32)

       local.get $argument
       i32.eqz

       (if (then
	    ;; fail if dividing by zero
	    i32.const -0x50000000
	    return))

       local.get $receiver
       local.get $argument
       i32.div_s
       i32.const 0
       i32.or
       local.set $result

       local.get $result
       local.get $argument
       i32.mul
       local.get $receiver
       i32.eq

       (if (then
	    local.get $result
	    return))

       ;; fail if result is not exact
       i32.const -0x50000000)

 (func $pop2AndPushNumResult
       (param $result i32)
       (result i32)
       (local $negative i32)
       (local $unsigned i32)
       (local $largeIntegerClass i32)
       (local $largeIntegerObject i32)
       (local $bytes i32)

       ;; return success indicator
       global.get $success
       (if (then
	    global.get $resultIsFloat
	    (if (then
		 i32.const 2
		 local.get $result
		 call $makeFloat
		 call $popNandPush
		 i32.const 1
		 return))

	    local.get $result
	    i32.const -0x40000000 ;; Squeak.MinSmallInt
	    i32.ge_s
	    local.get $result
	    i32.const 0x3FFFFFFF ;; Squeak.MaxSmallInt
	    i32.le_s
	    i32.and
	    (if (then
		 i32.const 2
		 local.get $result
		 call $popNandPush
		 i32.const 1
		 return))

	    local.get $result
	    i32.const 0
	    i32.const 0xFFFFFFFF
	    i32.sub
	    i32.ge_s
	    local.get $result
	    i32.const 0xFFFFFFFF
	    i32.le_s
	    i32.and
	    (if (then
		 local.get $result
		 i32.const 0
		 i32.lt_s
		 local.set $negative

		 local.get $negative
		 (if
		  (then
		   i32.const 0
		   local.get $result
		   i32.sub)
		  (else local.get $result))
		 local.set $unsigned

		 local.get $negative
		 (if
		  (then i32.const 42) ;; Squeak.splOb_ClassLargeNegativeInteger
		  (else i32.const 13)) ;; Squeak.splOb_ClassLargePositiveInteger
		 local.set $largeIntegerClass

		 local.get $largeIntegerClass
		 call $specialObjectAt
		 i32.const 4
		 call $instantiateClass
		 local.set $largeIntegerObject

		 local.get $largeIntegerObject
		 struct.get $object $bytes
		 local.set $bytes

		 i32.const 0
		 local.get $unsigned
		 i32.const 255
		 i32.and
		 array.set $bytes

		 i32.const 1
		 local.get $unsigned
		 i32.const 8
		 i32.shr_u
		 i32.const 255
		 i32.and
		 array.set $bytes

		 i32.const 2
		 local.get $unsigned
		 i32.const 16
		 i32.shr_u
		 i32.const 255
		 i32.and
		 array.set $bytes

		 i32.const 3
		 local.get $unsigned
		 i32.const 24
		 i32.shr_u
		 i32.const 255
		 i32.and
		 array.set $bytes

		 i32.const 2
		 local.get $largeIntegerObject
		 call $popNandPush
		 i32.const 1
		 return))))

       i32.const 0)

 (func $pop2AndPushBoolResult
       (param $result i32)
       (result i32)

       global.get $success
       i32.eqz
       (if (then
	    i32.const 0
	    return))

       i32.const 2
       local.get $result
       (if
	(then
	 global.get $trueObject)
	(else
	 global.get $falseObject))
       call $popNandPush
       i32.const 1)

 (func $stackInteger
       (param $depth i32)
       (result i32)

       local.get $depth
       call $stackValue
       call $checkSmallInt)

 (func $stackIntOrFloat
       (param $depth i32)
       (result i32)
       (local $number i32)
       (local $object i32)
       (local $endingAddress i32)
       (local $value i32)

       local.get $depth
       call $stackValue
       local.set $number

       ;; Is it a SmallInteger?
       local.get $number
       call $isInteger
       
       (if (then
	    local.get $number
	    return))

       ;; Is it a float?
       local.get $number
       call $isFloat

       (if (then
	    i32.const 1
	    global.set $resultIsFloat
	    local.get $number
	    call $float
	    return))

       ;; Maybe a 32-bit LargeInt?
       local.get $number
       struct.get $object $class
       i32.const 13 ;; Squeak.splOb_ClassLargePositiveInteger
       call $specialObjectAt
       i32.eq
       local.get $number
       struct.get $object $class
       i32.const 42 ;; Squeak.splOb_ClassLargeNegativeInteger
       call $specialObjectAt
       i32.eq
       i32.or

       (if
	(then
	 local.get $number
	 struct.get $object $bytes
	 
xxx
	 
       local.set $object
       local.get $object
       i32.const 3
       i32.add
       local.set $endingAddress
       i32.const 0
       local.set $value

       (loop $loop1
	     local.get $value
	     local.get $value
	     i32.const 256
	     i32.mul
	     local.get $object
	     call $load8BitInteger
	     i32.add
	     i32.add
	     local.set $value
	     local.get $endingAddress
	     i32.gt_u
	     br_if $loop1)

       (if (then
	    local.get $value
	    return))

       local.get $number
       struct.get $object $class

       call $specialObjectAt
       i32.eq
       (if (then
	    i32.const 0
	    local.get $value
	    i32.sub
	    return))

       call $beUnsuccessful
       i32.const 0)

 (func $mod
       (param $receiver i32)
       (param $argument i32)
       (result i32)

       local.get $argument
       i32.eqz
       (if (then
	    i32.const -0x50000000 ;; Squeak.NonSmallInt
	    return))

       local.get $receiver
       local.get $receiver
       local.get $argument
       i32.div_s
       f32.floor
       i32.sub
       local.get $argument
       i32.sub)

 (func $checkForInterrupts
       (local $now i32)
       (local $semaphore i32)

       ;; Check for interrupts at sends and backward jumps.
       
       call $millisecondClockValue
       local.set $now

       local.get $now
       global.get $lastTick
       i32.lt_u
       (if (then
	    ;; millisecond clock wrapped
	    local.get $now
	    global.get $nextPollTick
	    global.get $lastTick
	    i32.sub
	    i32.add
	    global.set $nextPollTick

	    local.get $now
	    global.get $breakOutTick
	    global.get $lastTick
	    i32.sub
	    i32.add
	    global.set $breakOutTick

	    global.get $nextWakeupTick
	    i32.eqz
	    i32.eqz
	    (if (then
		 local.get $now
		 global.get $nextWakeupTick
		 global.get $lastTick
		 i32.sub
		 i32.add
		 global.set $nextWakeupTick))))

       ;; Feedback logic attempts to keep interrupt response around 3ms...
       global.get $interruptCheckCounter
       i32.const -100
       i32.gt_s
       (if (then
	    ;; only if not a forced check
	    local.get $now
	    global.get $lastTick
	    i32.sub
	    global.get $interruptChecksEveryNms
	    i32.lt_s
	    (if
	     (then
	      ;; wrapping is not a concern
	      global.get $interruptCheckCounterFeedBackReset
	      i32.const 10
	      i32.add
	      global.set $interruptCheckCounterFeedBackReset)
	     (else
	      ;; do a thousand sends even if we are too slow for 3ms
	      global.get $interruptCheckCounterFeedBackReset
	      i32.const 1000
	      i32.le_s
	      (if
	       (then
		i32.const 1000
		global.set $interruptCheckCounterFeedBackReset)
	       (else
		global.get $interruptCheckCounterFeedBackReset
		i32.const 12
		i32.sub
		global.set $interruptCheckCounterFeedBackReset))))))

       ;; reset the interrupt check counter
       global.get $interruptCheckCounterFeedBackReset
       global.set $interruptCheckCounter

       ;; used to detect wraparound of millisecond clock
       local.get $now
       global.set $lastTick

       global.get $interruptPending
       (if (then
	    ;; reset interrupt flag
	    i32.const 0
	    global.set $interruptPending
	    i32.const 30 ;; Squeak.splOb_TheInterruptSemaphore
	    call $specialObjectAt
	    local.set $semaphore

	    local.get $semaphore
	    call $isNil
	    i32.eqz
	    (if (then
		 local.get $semaphore
		 call $synchronousSignal))))

       global.get $nextWakeupTick
       i32.eqz
       i32.eqz
       local.get $now
       global.get $nextWakeupTick
       i32.ge_s
       i32.and
       (if (then
	    ;; reset timer interrupt
	    i32.const 0
	    global.set $nextWakeupTick

	    i32.const 29 ;; Squeak.splOb_TheTimerSemaphore
	    call $specialObjectAt
	    local.set $semaphore

	    local.get $semaphore
	    call $isNil
	    i32.eqz
	    (if (then
		 local.get $semaphore
		 call $synchronousSignal))))

       global.get $pendingFinalizationSignals
       i32.const 0
       i32.gt_u
       (if (then
	    ;; signal any pending finalizations
	    i32.const 41 ;; Squeak.splOb_TheFinalizationSemaphore
	    call $specialObjectAt
	    local.set $semaphore

	    i32.const 0
	    global.set $pendingFinalizationSignals

	    local.get $semaphore
	    call $isNil
	    i32.eqz
	    (if (then
		 local.get $semaphore
		 call $synchronousSignal))))

       global.get $numberOfSemaphoresToSignal
       i32.const 0
       i32.gt_u
       (if (then
	    ;; signal pending semaphores, if any
	    call $signalExternalSemaphores))

       ;; if this is a long-running do-it, compile it
       global.get $method
       call $isCompiled
       i32.eqz
       global.get $compiler
       i32.eqz
       i32.eqz
       i32.and
       global.get $method
       i32.const 122 ;; Squeak.splOb_ReloadingMethod
       call $specialObjectAt
       i32.eq
       i32.eqz
       i32.and
       (if (then
	    global.get $method
	    call $compile))

       ;; have to return to web browser once in a while
       local.get $now
       global.get $breakOutTick
       i32.ge_u
       (if (then
	    call $breakOut)))

 (func $callPrimBytecode
       ;; skip over primitive number
       global.get $pc
       i32.const 2
       i32.add
       global.set $pc

       global.get $primFailCode
       (if (then
	    call $currentInstruction
	    i32.const 0x81 ;; extended store
	    i32.eq
	    (if (then
		 call $getErrorObjectFromPrimFailCode
		 call $stackTopPut))

	    i32.const 0
	    global.set $primFailCode)))

 (func $objectAt
       (param $cameFromInstruction i32)
       (param $convertChars i32)
       (param $includeInstVars i32)
       (result i32)
       (local $array i32)
       (local $index i32)
       (local $info i32)
       (local $floatData i32)
       (local $offset i32)

       ;; Returns result of at: or sets success false.

       i32.const 1
       call $stackNonInteger
       local.set $array

       i32.const 0
       call $stackPos32BitInt
       ;; note non-int returns zero
       local.set $index

       global.get $success
       i32.eqz
       (if (then
	    local.get $array
	    return))

       local.get $cameFromInstruction
       (if
	(then
	 ;; fast entry checks cache
	 local.get $array
	 struct.get $object $hash
	 global.get $atCacheMask
	 i32.and
	 call $atCacheAt
	 local.set $info

	 local.get $info
	 call $load32BitInteger ;; array is at offset 0
	 local.get $array
	 i32.eqz
	 (if (then
	      call $beUnsuccessful
	      local.get $array
	      return)))

	 (else
	  ;; slow entry installs in cache if appropriate
	  local.get $array
	  call $isFloat
	  (if (then
	       ;; present float as word array
	       local.get $array
	       call $floatData
	       local.set $floatData

	       local.get $index
	       i32.const 1
	       i32.eq
	       (if (then
		    local.get $floatData
		    i32.const 0
		    i32.const 0
		    call $getUint32
		    call $pos32BitIntFor
		    return))

	       local.get $index
	       i32.const 2
	       i32.eq
	       (if (then
		    local.get $floatData
		    i32.const 4
		    i32.const 0
		    call $getUint32
		    call $pos32BitIntFor
		    return))

	       call $beUnsuccessful
	       local.get $array
	       return))

	  global.get $atCache
	  i32.const 32
	  call $specialSelectorsAt
	  local.get $array
	  local.get $convertChars
	  local.get $includeInstVars
	  call $makeAtCacheInfo
	  local.set $info))

       local.get $index
       i32.const 1
       i32.lt_u
       local.get $index
       local.get $info
       call $load32BitInteger ;; info.size is at offset 0
       i32.gt_u
       i32.or
       (if (then
	    call $beUnsuccessful
	    local.get $array
	    return))

       local.get $includeInstVars
       (if (then
	    ;; pointers...   instVarAt and objectAt
	    local.get $array
	    local.get $index
	    i32.const 1
	    i32.sub
	    call $pointerOfAt
	    return))

       local.get $array
       call $hasPointers
       (if (then
	    ;; pointers...   normal at:
	    local.get $array
	    local.get $index
	    i32.const 1
	    i32.sub
	    local.get $info
	    i32.const 4 ;; info.ivarOffset offset is 4
	    i32.add
	    call $load32BitInteger
	    i32.add
	    call $pointerOfAt
	    return))

       local.get $array
       call $hasWords
       (if (then
	    ;; words...
	    local.get $info
	    i32.const 8 ;; info.convertChars offset is 8
	    i32.add
	    call $load32BitInteger
	    (if
	     (then
	      local.get $array
	      local.get $index
	      i32.const 1
	      i32.sub
	      call $wordOfAt
	      i32.const 0x3FFFFFFF
	      i32.and
	      call $charFromInt
	      return)
	     (else
	      local.get $array
	      local.get $index
	      i32.const 1
	      i32.sub
	      call $wordOfAt
	      call $pos32BitIntFor
	      return))))

       local.get $array
       call $hasBytes
       (if (then
	    local.get $info
	    i32.const 8 ;; info.convertChars offset is 8
	    call $load32BitInteger
	    (if
	     (then
	      local.get $array
	      local.get $index
	      i32.const 1
	      i32.sub
	      call $byteOfAt
	      i32.const 0xFF
	      i32.and
	      call $charFromInt
	      return)
	     (else
	      local.get $array
	      local.get $index
	      i32.const 1
	      i32.sub
	      call $byteOfAt
	      i32.const 0xFF
	      i32.and
	      call $charFromInt
	      return))))

       ;; methods must simulate Squeak's method indexing
       local.get $array
       call $pointersSize
       i32.const 4
       i32.mul
       local.set $offset

       local.get $index
       i32.const 1
       i32.sub
       local.get $offset
       i32.sub
       i32.const 0
       i32.lt_s
       (if (then
	    ;; reading lits as bytes
	    call $beUnsuccessful
	    local.get $array
	    return))
	
       local.get $array
       local.get $index
       i32.const 1
       i32.sub
       local.get $offset
       i32.sub
       call $byteOfAt
       i32.const 0xFF
       i32.and
       return)
       
 (func $interpretOne (export "interpretOne")
       (local $firstInstructionByte i32)
       (local $secondInstructionByte i32)
       
       call $receiver
       global.set $receiver
       
       i32.const 101050000
       global.set $dirtyTableAddress
       global.get $dirtyTableAddress
       i32.const 0x0FFFFFFF
       call $store32BitInteger

       call $nextByte
       local.set $firstInstructionByte
       local.get $firstInstructionByte
       i32.const 0xF
       i32.le_u

       (if
	(then
	 global.get $receiver ;; push receiver address
	 local.get $firstInstructionByte
	 i32.const 15
	 i32.and
	 call $pointerOfAt
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x1F
       i32.le_u

       (if
	(then
	 call $homeContext
	 i32.const 6
	 local.get $firstInstructionByte
	 i32.const 15
	 i32.and
	 i32.add
	 call $pointerOfAt
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x3F
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 0x1F
	 i32.and
	 call $methodGetLiteral
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x5F
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 31
	 i32.and
	 call $methodGetLiteral
	 i32.const 1 ;; Squeak.Assn_value
	 call $pointerOfAt
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x67
       i32.le_u

       (if
	(then
	 global.get $receiver
	 call $beDirty
	 global.get $receiver
	 i32.const 7
	 local.get $firstInstructionByte
	 i32.and
	 call $pop
	 call $pointerOfAtPutPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x6F
       i32.le_u

       (if
	(then
	 call $homeContext
	 i32.const 6 ;; Squeak.Context_tempFrameStart
	 local.get $firstInstructionByte
	 i32.const 7
	 i32.and
	 i32.add
	 call $pop
	 call $pointerOfAtPutPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x70
       i32.eq

       (if
	(then
	 global.get $receiver
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x71
       i32.eq

       (if
	(then
	 call $true
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x72
       i32.eq

       (if
	(then
	 call $false
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x73
       i32.eq

       (if
	(then
	 call $nil
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x74
       i32.eq

       (if
	(then
	 i32.const -1
	 call $encodeSmallInteger
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x75
       i32.eq

       (if
	(then
	 i32.const 0
	 call $encodeSmallInteger
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x76
       i32.eq

       (if
	(then
	 i32.const 1
	 call $encodeSmallInteger
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x77
       i32.eq

       (if
	(then
	 i32.const 2
	 call $encodeSmallInteger
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x78
       i32.eq

       (if
	(then
	 global.get $receiver
	 i32.const 0
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x79
       i32.eq

       (if
	(then
	 call $true
	 i32.const 0
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x7A
       i32.eq

       (if
	(then
	 call $false
	 i32.const 0
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x7B
       i32.eq

       (if
	(then
	 call $nil
	 i32.const 0
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x7C
       i32.eq

       (if
	(then
	 call $pop
	 i32.const 0
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x7D
       i32.eq

       (if
	(then
	 call $pop
	 call $activeContext
	 i32.const 0 ;; Squeak.BlockContext_caller
	 call $pointerOfAt
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x7E
       i32.eq

       (if
	(then
	 unreachable
	 return))

       local.get $firstInstructionByte
       i32.const 0x7F
       i32.eq

       (if
	(then
	 unreachable
	 return))

       local.get $firstInstructionByte
       i32.const 0x80
       i32.eq

       (if
	(then
	 call $nextByte
	 call $extendedPush
	 return))

       local.get $firstInstructionByte
       i32.const 0x81
       i32.eq

       (if
	(then
	 call $nextByte
	 call $extendedStore
	 return))

       local.get $firstInstructionByte
       i32.const 0x82
       i32.eq

       (if
	(then
	 call $nextByte
	 call $extendedStorePop
	 return))

       local.get $firstInstructionByte
       i32.const 0x83
       i32.eq

       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
 	 local.get $secondInstructionByte
	 i32.const 31
	 i32.and
	 call $methodGetSelector
	 local.get $secondInstructionByte
	 i32.const 5
	 i32.shr_u
	 i32.const 0
	 call $send
	 return))

       local.get $firstInstructionByte
       i32.const 0x84
       i32.eq

       (if
	(then
	 call $nextByte
	 call $doubleExtendedDoAnything
	 return))
       
       local.get $firstInstructionByte
       i32.const 0x85
       i32.eq
       
       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
	 local.get $secondInstructionByte
	 i32.const 31
	 i32.and
	 call $methodGetSelector
	 local.get $secondInstructionByte
	 i32.const 5
	 i32.shr_u
	 i32.const 1
	 call $send
	 return))

       local.get $firstInstructionByte
       i32.const 0x86
       i32.eq
       
       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
	 local.get $secondInstructionByte
	 i32.const 63
	 i32.and
	 call $methodGetSelector
	 local.get $secondInstructionByte
	 i32.const 6
	 i32.shr_u
	 i32.const 0
	 call $send
	 return))

       local.get $firstInstructionByte
       i32.const 0x87
       i32.eq

       (if
	(then
	 call $pop
	 return))

       local.get $firstInstructionByte
       i32.const 0x88
       i32.eq

       (if
	(then
	 call $top
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x89
       i32.eq

       (if
	(then
	 call $pushExportThisContext
	 return))

       local.get $firstInstructionByte
       i32.const 0x8A
       i32.eq

       (if
	(then
	 call $nextByte
	 call $pushNewArray
	 return))

       local.get $firstInstructionByte
       i32.const 0x8B
       i32.eq

       (if
	(then
	 call $callPrimBytecode
	 return))

       local.get $firstInstructionByte
       i32.const 0x8C
       i32.eq

       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
	 call $homeContext
	 i32.const 6
	 call $nextByte
	 i32.add
	 call $pointerOfAt
	 local.get $secondInstructionByte
	 call $pointerOfAt
	 call $pushPointer
	 return))

       local.get $firstInstructionByte
       i32.const 0x8D
       i32.eq
       
       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
	 call $homeContext
	 i32.const 6
	 call $nextByte
	 i32.add
	 call $pointerOfAt
	 local.get $secondInstructionByte
	 call $top
	 call $pointerOfAt
	 return))

       local.get $firstInstructionByte
       i32.const 0x8E
       i32.eq
       
       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
	 call $homeContext
	 i32.const 6
	 call $nextByte
	 i32.add
	 call $pointerOfAt
	 local.get $secondInstructionByte
	 call $top
	 call $pointerOfAt
	 call $pop
	 return))

       local.get $firstInstructionByte
       i32.const 0x8F
       i32.eq

       (if
	(then
	 call $pushClosureCopy
	 return))

       local.get $firstInstructionByte
       i32.const 0x97
       i32.le_u

       (if
	(then
	 call $pc
	 local.get $firstInstructionByte
	 i32.const 7
	 i32.and
	 i32.const 1
	 i32.add
	 i32.add
	 call $setPC
	 return))

       local.get $firstInstructionByte
       i32.const 0x9F
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 7
	 i32.and
	 i32.const 1
	 i32.add
	 call $jumpIfFalse
	 return))

       local.get $firstInstructionByte
       i32.const 0xA7
       i32.le_u

       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
	 call $pc
	 local.get $firstInstructionByte
	 i32.const 7
	 i32.and
	 i32.const 4
	 i32.sub
	 i32.const 256
	 i32.mul
	 local.get $secondInstructionByte
	 i32.add
	 i32.add
	 call $setPC

	 local.get $firstInstructionByte
	 i32.const 7
	 i32.and
	 i32.const 4
	 i32.lt_u

	 (if
	  (then
	   global.get $interruptCheckCounter
   	   i32.const 1
	   i32.sub
	   global.set $interruptCheckCounter
	   global.get $interruptCheckCounter
	   i32.const 0
	   i32.le_u
	   (if
	    (then
	     call $checkForInterrupts
	     return))))
	 return))

       local.get $firstInstructionByte
       i32.const 0xAB
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 3
	 i32.and
	 i32.const 256
	 i32.mul
	 call $nextByte
	 i32.add
	 call $jumpIfTrue
	 return))

       local.get $firstInstructionByte
       i32.const 0xAF
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 3
	 i32.and
	 i32.const 256
	 i32.mul
	 call $nextByte
	 i32.add
	 call $jumpIfFalse
	 return))

       local.get $firstInstructionByte
       i32.const 0xB0
       i32.eq

       (if
	(then
	 call $beSuccessful
	 i32.const 0
	 call $setResultIsFloat
	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.add
	 call $pop2AndPushNumResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xB1
       i32.eq

       (if
	(then
	 call $beSuccessful
	 i32.const 0
	 call $setResultIsFloat

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.sub
	 call $pop2AndPushNumResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))
       
       local.get $firstInstructionByte
       i32.const 0xB2
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.lt_s
	 call $pop2AndPushBoolResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xB3
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.gt_s
	 call $pop2AndPushBoolResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xB4
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.le_s
	 call $pop2AndPushBoolResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xB5
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.ge_s
	 call $pop2AndPushBoolResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xB6
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.eq
	 call $pop2AndPushBoolResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xB7
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.ne
	 call $pop2AndPushBoolResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xB8
       i32.eq

       (if
	(then
	 call $beSuccessful
	 i32.const 0
	 call $setResultIsFloat

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.mul
	 call $pop2AndPushNumResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xB9
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 i32.div_u
	 call $pop2AndPushIntResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xBA
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 call $mod
	 call $pop2AndPushIntResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xBB
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 i32.const 0
	 call $primitiveMakePoint
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xBC
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 call $pop2AndPushIntResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xBD
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 call $div
	 call $pop2AndPushIntResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xBE
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 i32.and
	 call $pop2AndPushIntResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xBF
       i32.eq

       (if
	(then
	 call $beSuccessful

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 i32.or
	 call $pop2AndPushIntResult
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xCF
       i32.le_u

       (if
	(then
	 global.get $receiver
	 local.get $firstInstructionByte
	 i32.const 15
	 i32.and
	 call $quickSendOther
	 i32.eqz

	 (if
	  (then
	   local.get $firstInstructionByte
	   i32.const 15
	   i32.and
	   i32.const 16
	   i32.add
	   call $sendSpecial
	   return))

	 return))

       local.get $firstInstructionByte
       i32.const 0xDF
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 15
	 i32.and
	 call $methodGetSelector
	 i32.const 0
	 i32.const 0
	 call $send
	 return))

       local.get $firstInstructionByte
       i32.const 0xEF
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 15
	 i32.and
	 call $methodGetSelector
	 i32.const 1
	 i32.const 0
	 call $send
	 return))

       local.get $firstInstructionByte
       i32.const 0xFF
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 15
	 i32.and
	 call $methodGetSelector
	 i32.const 2
	 i32.const 0
	 call $send
	 return))

       i32.const 100050000
       call $load32BitInteger
       i32.const 512
       i32.eq
       (if
	(then
	 unreachable))))

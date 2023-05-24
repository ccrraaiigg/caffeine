(module
 (import "wasm" "memory"  (memory 1600 1800 shared))

 (import "wasm" "doReturn" (func $doReturn (param i32) (param i32) (result i32)))
 (import "wasm" "send" (func $send (param i32) (param i32) (param i32)))
 (import "wasm" "quickSendOther" (func $quickSendOther (param i32) (param i32) (result i32)))
 (import "wasm" "stackInteger" (func $stackInteger (param i32) (result i32)))
 (import "wasm" "setSuccess" (func $setSuccess (param i32)))
 (import "wasm" "primitiveMakePoint" (func $primitiveMakePoint (param i32) (param i32) (result i32)))
 (import "wasm" "mod" (func $mod (param i32) (param i32) (result i32)))
 (import "wasm" "pop2AndPushIntResult" (func $pop2AndPushIntResult (param i32) (result i32)))
 (import "wasm" "pop2AndPushDivResult" (func $pop2AndPushDivResult (param i32) (param i32) (result i32)))
 (import "wasm" "pop2AndPushNumResult" (func $pop2AndPushNumResult (param i32) (result i32)))
 (import "wasm" "pop2AndPushBoolResult" (func $pop2AndPushBoolResult (param i32) (result i32)))
 (import "wasm" "stackIntOrFloat" (func $stackIntOrFloat (param i32) (result i32)))
 (import "wasm" "setResultIsFloat" (func $setResultIsFloat (param i32)))
 (import "wasm" "checkForInterrupts" (func $checkForInterrupts))
 (import "wasm" "setTheInterruptCheckCounter" (func $setTheInterruptCheckCounter (param i32)))
 (import "wasm" "theInterruptCheckCounter" (func $theInterruptCheckCounter (result i32)))
 (import "wasm" "callPrimBytecode" (func $callPrimBytecode (result i32)))
 (import "wasm" "pushClosureCopy" (func $pushClosureCopy (result i32)))
 (import "wasm" "pushNewArray" (func $pushNewArray (param i32) (result i32)))
 (import "wasm" "pushExportThisContext" (func $pushExportThisContext))
 (import "wasm" "setByteCodeCount" (func $setByteCodeCount (param i32)))
 (import "wasm" "theByteCodeCount" (func $theByteCodeCount (result i32)))
 
 (global $dirtyTableAddress (mut i32) (i32.const 0))
 (global $activeContext (mut i32) (i32.const 0))
 (global $receiver (mut i32) (i32.const 0))
 (global $method (mut i32) (i32.const 0))
 (global $pc (mut i32) (i32.const 0))
 (global $sp (mut i32) (i32.const 0))

 (global $association (mut i32) (i32.const 0))
 (global $processor (mut i32) (i32.const 0))
 (global $process (mut i32) (i32.const 0))
 (global $numberOfMethodLiterals (mut i32) (i32.const 0))
 (global $methodBytes (mut i32) (i32.const 0))

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

 (func $store32BitsWithSwitchedEndianness
       (param $address i32)
       (param $value i32)

       local.get $value
       i32.const 0x80000000
       i32.eq
       (if
	(then
	 unreachable))
       
       local.get $address
       local.get $value
       call $switch32BitEndianness
       i32.store)
       
 (func $load32BitsWithSwitchedEndianness
       (param $address i32)
       (result i32)

       local.get $address
       i32.const 0
       i32.lt_s
       (if (result i32)
	(then
	 unreachable)
	(else
	 local.get $address
	 i32.const 104857600
	 i32.gt_u
	 (if (result i32)
	  (then
	   unreachable)
	  (else
	   local.get $address
	   i32.load
	   call $switch32BitEndianness)))))

 (func $addressOfPointerOfAt
       (param $address i32)
       (param $index i32)
       (result i32)
       (local $headerType i32)

       local.get $address
       i32.const 0
       i32.lt_s
       (if (result i32)
	(then
	 unreachable)
	(else 
	 local.get $address
	 local.get $address
	 call $numberOfObjectHeaderWords
	 i32.const 4
	 i32.mul
	 i32.add
	 local.get $index
	 i32.const 4
	 i32.mul
	 i32.add)))

 (func $integerOfAt
       (param $address i32)
       (param $index i32)
       (result i32)
       (local $value i32)

       local.get $address
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
       (param $address i32)
       (param $index i32)
       (result i32)
       
       local.get $address
       local.get $index
       call $addressOfPointerOfAt
       call $load32BitsWithSwitchedEndianness)

 (func $recordDirtyObject
       (param $object i32)
       (local $currentAddress i32)

       global.get $dirtyTableAddress
       local.get $object
       call $store32BitsWithSwitchedEndianness
       global.get $dirtyTableAddress
       i32.const 4
       i32.add
       global.set $dirtyTableAddress
       global.get $dirtyTableAddress
       i32.const 0x0FFFFFFF
       call $store32BitsWithSwitchedEndianness)

 (func $pointerOfAtPutPointer
       (param $address i32)
       (param $index i32)
       (param $oop i32)

       local.get $oop
       i32.const 4161536
       i32.eq
       (if
	(then
	 unreachable))
       
       local.get $address
       local.get $index
       call $addressOfPointerOfAt
       local.get $oop
       call $store32BitsWithSwitchedEndianness

       ;; Note the object in the dirty objects table.
       local.get $address
       call $recordDirtyObject)
       
 (func $pointerOfAtPutInteger
       (param $address i32)
       (param $index i32)
       (param $integer i32)

       local.get $address
       local.get $index
       call $addressOfPointerOfAt
       local.get $integer
       call $encodeSmallInteger
       call $store32BitsWithSwitchedEndianness

       ;; Note the object in the dirty objects table.
       local.get $address
       call $recordDirtyObject)
       
 (func $activeContext
       (result i32)
       (local $result i32)
       
       call $specialObjectsArray
       i32.const 3
       call $pointerOfAt ;; fetch the address of the Processor association
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
	 call $load32BitsWithSwitchedEndianness)
	(else
	 local.get $result
	 i32.const 0
	 i32.eq
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

 (func $numberOfObjectHeaderWords
       (param $object i32)
       (result i32)
       (local $headerType i32)

       local.get $object
       call $load32BitsWithSwitchedEndianness
       i32.const 3 ;; Squeak.HeaderTypeMask
       i32.and
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
       global.set $methodBytes
       global.get $methodBytes)

 (func $addressOfProgramCounter
       (result i32)

       call $activeContext
       i32.const 8
       i32.add)
       
 (func $pc
       (result i32)

       call $addressOfProgramCounter
       call $load32BitsWithSwitchedEndianness ;; fetch the encoded (SmallInteger *and* byte-offset) program counter
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
       global.set $numberOfMethodLiterals
       global.get $numberOfMethodLiterals)
       
 (func $setPC
       (param $newPC i32)

       local.get $newPC
       global.set $pc

       call $addressOfProgramCounter

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
       call $store32BitsWithSwitchedEndianness
       call $activeContext
       call $recordDirtyObject)

 (func $nextByte
       (result i32)
       (local $theMethodBytes i32)
       (local $thePC i32)
       (local $address i32)
       
       call $methodBytes
       local.set $theMethodBytes
       local.get $theMethodBytes
       call $pcThenIncrement
       local.set $thePC
       local.get $thePC
       i32.add
       local.set $address
       local.get $address
       i32.const 104857600
       i32.ge_s
       (if
	(then
	 unreachable))
       local.get $address
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
       (param $context i32)
       (result i32)

       local.get $context
       call $load32BitsWithSwitchedEndianness
       i32.const 12
       i32.shr_u
       i32.const 31
       i32.and
       i32.const 13
       i32.eq)
       
 (func $homeContextOf
       (param $context i32)
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
       call $homeContextOf)

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

 (func $beDirty
       (param $object i32)
       (local $dirty i32)

       ;; Set a dirty bit in the object's first header word.
       local.get $object
       call $load32BitsWithSwitchedEndianness
       i32.const 0x80000000
       i32.or
       local.set $dirty
       local.get $object
       local.get $dirty
       call $store32BitsWithSwitchedEndianness)

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
       i32.const 0
       i32.eq
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
       i32.const 0
       i32.eq
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
       i32.const 0
       i32.eq
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
       i32.const 0
       i32.eq
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

 (func $specialObjectsArray
       (result i32)

       i32.const 0
       call $load32BitsWithSwitchedEndianness)
       
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
	   call $specialObjectsArray
	   i32.const 25 ;; Squeak.splOb_SelectorMustBeBoolean
	   call $pointerOfAt
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
	   call $specialObjectsArray
	   i32.const 25 ;; Squeak.splOb_SelectorMustBeBoolean
	   call $pointerOfAt
	   i32.const 0
	   i32.const 0
	   call $send)))))

  (func $sendSpecial
	(param $lobits i32)
	(local $specialSelectors i32)
	(local $selectorAddress i32)
	
	call $specialObjectsArray
	i32.const 23 ;; Squeak.splOb_SpecialSelectors
	call $pointerOfAt
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

 (func $interpretOne (export "interpretOne")
       (local $firstInstructionByte i32)
       (local $secondInstructionByte i32)
       (local $interruptCheckCounter i32)
       
       call $receiver
       global.set $receiver
       
       i32.const 101050000
       global.set $dirtyTableAddress
       global.get $dirtyTableAddress
       i32.const 0x0FFFFFFF
       call $store32BitsWithSwitchedEndianness

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
	   call $theInterruptCheckCounter
   	   i32.const 1
	   i32.sub
	   local.set $interruptCheckCounter
	   local.get $interruptCheckCounter
	   call $setTheInterruptCheckCounter
	   local.get $interruptCheckCounter
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
	 i32.const 1
	 call $setSuccess
	 i32.const 0
	 call $setResultIsFloat
	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.add
	 call $pop2AndPushNumResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess
	 i32.const 0
	 call $setResultIsFloat

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.sub
	 call $pop2AndPushNumResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.lt_s
	 call $pop2AndPushBoolResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.gt_s
	 call $pop2AndPushBoolResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.le_s
	 call $pop2AndPushBoolResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.ge_s
	 call $pop2AndPushBoolResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.eq
	 call $pop2AndPushBoolResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.ne
	 call $pop2AndPushBoolResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess
	 i32.const 0
	 call $setResultIsFloat

	 i32.const 1
	 call $stackIntOrFloat
	 i32.const 0
	 call $stackIntOrFloat
	 i32.mul
	 call $pop2AndPushNumResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 i32.div_u
	 call $pop2AndPushIntResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 call $mod
	 call $pop2AndPushIntResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 i32.const 0
	 call $primitiveMakePoint
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 call $pop2AndPushIntResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 call $pop2AndPushDivResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 i32.and
	 call $pop2AndPushIntResult
	 i32.const 0
	 i32.eq

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
	 i32.const 1
	 call $setSuccess

	 i32.const 1
	 call $stackInteger
	 i32.const 0
	 call $stackInteger
	 i32.or
	 call $pop2AndPushIntResult
	 i32.const 0
	 i32.eq

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
	 i32.const 0
	 i32.eq

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
       call $load32BitsWithSwitchedEndianness
       i32.const 512
       i32.eq
       (if
	(then
	 unreachable))))

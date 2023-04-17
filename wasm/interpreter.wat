(module
 (import "wasm" "nextByte" (func $nextByte (result i32)))
 (import "wasm" "receiverBeDirty" (func $receiverBeDirty))
 (import "wasm" "pointersAt" (func $pointersAt (param i32) (param i32) (result i32)))
 (import "wasm" "pointersAtPut" (func $pointersAtPut (param i32) (param i32) (param i32)))
 (import "wasm" "homeContextPointersAtPut" (func $homeContextPointersAtPut (param i32) (param i32)))
 (import "wasm" "receiverPointersAtPut" (func $receiverPointersAtPut (param i32) (param i32)))
 (import "wasm" "push" (func $push (param i32)))
 (import "wasm" "extendedPush" (func $extendedPush (param i32)))
 (import "wasm" "extendedStore" (func $extendedStore (param i32)))
 (import "wasm" "extendedStorePop" (func $extendedStorePop (param i32)))
 (import "wasm" "pop" (func $pop (result i32)))
 (import "wasm" "methodGetLiteral" (func $methodGetLiteral (param i32) (result i32)))
 (import "wasm" "methodGetSelector" (func $methodGetSelector (param i32) (result i32)))
 (import "wasm" "doReturn" (func $doReturn (param i32) (param i32) (result i32)))
 (import "wasm" "nono" (func $nono (result i32)))
 (import "wasm" "send" (func $send (param i32) (param i32) (param i32) (result i32)))
 (import "wasm" "top" (func $top (result i32)))
 (import "wasm" "pushExportThisContext" (func $pushExportThisContext))
 (import "wasm" "pushNewArray" (func $pushNewArray (param i32) (result i32)))
 (import "wasm" "callPrimBytecode" (func $callPrimBytecode (result i32)))
 (import "wasm" "pushClosureCopy" (func $pushClosureCopy (result i32)))
 (import "wasm" "jumpIfFalse" (func $jumpIfFalse (param i32) (result i32)))
 (import "wasm" "jumpIfTrue" (func $jumpIfTrue (param i32) (result i32)))
 (import "wasm" "checkForInterrupts" (func $checkForInterrupts (result i32)))
 (import "wasm" "stackIntOrFloat" (func $stackIntOrFloat (param i32) (result i32)))
 (import "wasm" "stackInteger" (func $stackInteger (param i32) (result i32)))
 (import "wasm" "mod" (func $mod (param i32) (param i32) (result i32)))
 (import "wasm" "pop2AndPushBoolResult" (func $pop2AndPushBoolResult (param i32) (result i32)))
 (import "wasm" "pop2AndPushIntResult" (func $pop2AndPushIntResult (param i32) (result i32)))
 (import "wasm" "sendSpecial" (func $sendSpecial (param i32) (result i32)))
 (import "wasm" "primitiveMakePoint" (func $primitiveMakePoint (param i32) (param i32) (result i32)))
 (import "wasm" "quickSendOther" (func $quickSendOther (param i32) (param i32) (result i32)))
 (import "wasm" "pop2AndPushNumResult" (func $pop2AndPushNumResult (param i32) (result i32)))
 (import "wasm" "doubleExtendedDoAnything" (func $doubleExtendedDoAnything (param i32) (result i32)))

 (import "wasm" "setByteCodeCount" (func $setByteCodeCount (param i32)))
 (import "wasm" "setPC" (func $setPC (param i32)))
 (import "wasm" "setSuccess" (func $setSuccess (param i32)))
 (import "wasm" "setResultIsFloat" (func $setResultIsFloat (param i32)))

 (import "wasm" "thePC" (func $thePC (result i32)))
 (import "wasm" "theByteCodeCount" (func $theByteCodeCount (result i32)))
 (import "wasm" "theInterruptCheckCounter" (func $theInterruptCheckCounter (result i32)))
 (import "wasm" "setTheInterruptCheckCounter" (func $setTheInterruptCheckCounter (param i32)))
 (import "wasm" "contextTempFrameStart" (func $contextTempFrameStart (result i32)))
 (import "wasm" "associationValue" (func $associationValue (result i32)))
 (import "wasm" "theReceiver" (func $theReceiver (result i32)))
 (import "wasm" "theTrueObj" (func $theTrueObj (result i32)))
 (import "wasm" "theFalseObj" (func $theFalseObj (result i32)))
 (import "wasm" "theNilObj" (func $theNilObj (result i32)))
 (import "wasm" "theActiveContext" (func $theActiveContext (result i32)))
 (import "wasm" "theHomeContext" (func $theHomeContext (result i32)))
 (import "wasm" "blockContextCaller" (func $blockContextCaller (result i32)))
 (import "wasm" "pop2AndPushDivResult" (func $pop2AndPushDivResult (param i32) (param i32) (result i32)))
 (import "wasm" "safeShift" (func $safeShift (param i32) (param i32) (result i32)))

 (import "wasm" "log" (func $log (param i32)))

 (global $temp (mut i32))
 (global $bytecodeCount (mut i32) (i32.const 0))
 (global $nextAvailableAddress (mut i32) (i32.const 0))
 (global $startingObjectMemoryAddress i32 (i32.const 0x400))
 (global $position (mut i32) (i32.const 0))
 
 (memory $everything 0)
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
       
 (func $pointer
       (param $address i32)
       (param $size i32)
       (result i32)

       ;; Calculate the target address.
       global.get $startingObjectMemoryAddress
       global.get $position
       i32.add
       
       ;; Write the target address to the next pointer address.
       i32.store $nextAddress
       global.get $nextAddress
       global.set $temp
       call $incrementNextAddress

       ;; Write the pointee size to the next pointer address
       local.get $nWords
       i32.store $nextAddress
       call $incrementNextAddress

       ;; Leave the first pointer address on the stack.
       global.get $temp)

 (func $sizeOfPointer
       (param $pointer i32)

       local.get $pointer
       i32.const 1
       i32.add
       global.set $temp
       global.get $temp
       i32.load)

 (func $push
       (param $startingAaddress i32)
       (param $value i32)
       (local $address i32)
       (local $size)
       (local $contents)

       local.get $startingAddress
       local.set $address
       local.get $startingAddress
       i32.load
       local.set $size

       local.get $address
       i32.const 1
       i32.add
       
       (loop $loop
	     i32.load
	     local.set $contents
	     local.get $size
	     i32.const 1
	     i32.sub
	     local.set $size
	     local.get $size
	     i32.const 0
	     i32.eq
       
       
       

       
 (func $readWord
       (local $integer)

       global.get $position
       global.get $littleEndian
       call $getUint32
       local.set $integer
       global.get $position
       i32.const 4
       i32.add
       global.set $position
       local.get $integer)

 (func $readBits
       (param $nWords i32)
       (param $isPointers i32)
       (param $oops i32) ;; memory address of an array, first element is array size
       
       local.get $isPointers
       
       (if
	(then
	 ;; Do endianness conversion.
	 global.get $nextAddress
	 local.set $oops
	 local.get $oops
	 i32.store 0
	 
	 (loop $loop
	       local.get $oops
	       i32.load
	       local.get $nWords
	       i32.lt_u

	       (if
		(then
		 local.get $oops
		 call $readWord
		 call $push))

	       local.get $oops
	       i32.load
	       local.get $nWords
	       i32.lt_u
	       br_if $loop

	       local.get $oops
	       i32.load
	       return))
	(else
	 ;; words (no endianness conversion yet)




	 
 (func $readFromBuffer
       (local $littleEndian (i32.const 0))
       
       i32.const 0x52454144 ;; 'READ'
       call $log

       



 
 (func $interpretOne (export "interpretOne")
       (local $firstInstructionByte i32)
       (local $secondInstructionByte i32)

       global.get $bytecodeCount
       i32.const 1
       i32.add
       global.set $bytecodeCount

       call $nextByte
       local.set $firstInstructionByte
       local.get $firstInstructionByte
       i32.const 0xF
       i32.le_u

       (if
	(then
	 call $theReceiver
	 local.get $firstInstructionByte
	 i32.const 15
	 i32.and
	 call $pointersAt
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x1F
       i32.le_u

       (if
	(then
	 call $theHomeContext
	 call $contextTempFrameStart
	 local.get $firstInstructionByte
	 i32.const 15
	 i32.and
	 i32.add
	 call $pointersAt
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x3F
       i32.le_u

       (if
	(then
	 local.get $firstInstructionByte
	 i32.const 31
	 i32.and
	 call $methodGetLiteral
	 call $push
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
	 call $associationValue
	 call $pointersAt
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x67
       i32.le_u

       (if
	(then
	 call $receiverBeDirty
	 call $theReceiver
	 i32.const 7
	 local.get $firstInstructionByte
	 i32.and
	 call $pop
	 call $receiverPointersAtPut
	 return))

       local.get $firstInstructionByte
       i32.const 0x6F
       i32.le_u

       (if
	(then
	 call $contextTempFrameStart
	 local.get $firstInstructionByte
	 i32.const 7
	 i32.and
	 i32.add
	 call $pop
	 call $homeContextPointersAtPut
	 return))

       local.get $firstInstructionByte
       i32.const 0x70
       i32.eq

       (if
	(then
	 call $theReceiver
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x71
       i32.eq

       (if
	(then
	 call $theTrueObj
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x72
       i32.eq

       (if
	(then
	 call $theFalseObj
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x73
       i32.eq

       (if
	(then
	 call $theNilObj
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x74
       i32.eq

       (if
	(then
	 i32.const -1
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x75
       i32.eq

       (if
	(then
	 i32.const 0
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x76
       i32.eq

       (if
	(then
	 i32.const 1
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x77
       i32.eq

       (if
	(then
	 i32.const 2
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x78
       i32.eq

       (if
	(then
	 call $theReceiver
	 i32.const 0
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x79
       i32.eq

       (if
	(then
	 call $theTrueObj
	 i32.const 0
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x7A
       i32.eq

       (if
	(then
	 call $theFalseObj
	 i32.const 0
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x7B
       i32.eq

       (if
	(then
	 call $theNilObj
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
	 call $theActiveContext
	 call $blockContextCaller
	 call $pointersAt
	 call $doReturn
	 return))

       local.get $firstInstructionByte
       i32.const 0x7E
       i32.eq

       (if
	(then
	 call $nono
	 return))

       local.get $firstInstructionByte
       i32.const 0x7F
       i32.eq

       (if
	(then
	 call $nono
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
	 call $push
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
	 call $theHomeContext
	 call $contextTempFrameStart
	 call $nextByte
	 i32.add
	 call $pointersAt
	 local.get $secondInstructionByte
	 call $pointersAt
	 call $push
	 return))

       local.get $firstInstructionByte
       i32.const 0x8D
       i32.eq
       
       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
	 call $theHomeContext
	 call $contextTempFrameStart
	 call $nextByte
	 i32.add
	 call $pointersAt
	 local.get $secondInstructionByte
	 call $top
	 call $pointersAtPut
	 return))

       local.get $firstInstructionByte
       i32.const 0x8E
       i32.eq
       
       (if
	(then
	 call $nextByte
	 local.set $secondInstructionByte
	 call $theHomeContext
	 call $contextTempFrameStart
	 call $nextByte
	 i32.add
	 call $pointersAt
	 local.get $secondInstructionByte
	 call $top
	 call $pointersAtPut
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
	 call $thePC
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
	 call $thePC
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
	   i32.const 0
	   local.set $temp
	   call $theInterruptCheckCounter
   	   i32.const 1
	   i32.sub
	   call $setTheInterruptCheckCounter
	   local.get $temp
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
	 call $safeShift
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
	 local.get $firstInstructionByte
	 local.set $temp
	 call $theReceiver
	 local.get $temp
	 i32.const 15
	 i32.and
	 call $quickSendOther
	 i32.const 0
	 i32.eq

	 (if
	  (then
	   local.get $temp
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

       return))

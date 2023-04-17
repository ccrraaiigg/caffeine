(module
 (memory (import "wasm" "memory") 1)

  (func $partitionedMUL (export "partitionedMUL")
    (param $word1 i32)
    (param $word2 i32)
    (param $nBits i32)
    (param $nParts i32)

    (result i32)

    (local $dMask i32)
    (local $result i32)
    (local $product i32)
    (local $sMask i32)

    local.get $nBits
    i32.const 4
    i32.mul
    i32.load
    local.set $sMask

    local.get $sMask
    local.get $nBits
    i32.shl
    local.set $dMask

    local.get $word1
    local.get $sMask
    i32.and
    i32.const 1
    i32.add
    local.get $word2
    local.get $sMask
    i32.and
    i32.const 1
    i32.add
    i32.mul
    i32.const 1
    i32.sub
    local.get $dMask
    i32.and
    local.get $nBits
    i32.shr_u
    local.set $result

    local.get $nParts
    i32.const 1
    i32.eq

    (if
      (then
        local.get $result
	return))

    local.get $word1
    local.get $nBits
    i32.shr_u
    local.get $sMask
    i32.and
    i32.const 1
    i32.add
    local.get $word2
    local.get $nBits
    i32.shr_u
    local.get $sMask
    i32.and
    i32.const 1
    i32.add
    i32.mul
    i32.const 1
    i32.sub
    local.get $dMask
    i32.and
    local.set $product
    local.get $result
    local.get $product
    i32.or
    local.set $result

    local.get $nParts
    i32.const 2
    i32.eq

    (if
      (then
        local.get $result
	return))

    local.get $word1
    i32.const 2
    local.get $nBits
    i32.mul
    i32.shr_u
    local.get $sMask
    i32.and
    i32.const 1
    i32.add
    local.get $word2
    i32.const 2
    local.get $nBits
    i32.mul
    i32.shr_u
    local.get $sMask
    i32.and
    i32.const 1
    i32.add
    i32.mul
    i32.const 1
    i32.sub
    local.get $dMask
    i32.and
    local.set $product
    local.get $result
    local.get $product
    local.get $nBits
    i32.shl
    i32.or
    local.set $result

    local.get $nParts
    i32.const 3
    i32.eq

    (if
      (then
        local.get $result
	return))

    local.get $word1
    i32.const 3
    local.get $nBits
    i32.mul
    i32.shr_u
    local.get $sMask
    i32.and
    i32.const 1
    i32.add
    local.get $word2
    i32.const 3
    local.get $nBits
    i32.mul
    i32.shr_u
    local.get $sMask
    i32.and
    i32.const 1
    i32.add
    i32.mul
    i32.const 1
    i32.sub
    local.get $dMask
    i32.and
    local.set $product
    local.get $result
    local.get $product
    i32.const 2
    local.get $nBits
    i32.mul
    i32.shl
    i32.or
    local.set $result
    local.get $result
    return)

  (func $partitionedADD (export "partitionedADD")
    (param $word1 i32)
    (param $word2 i32)
    (param $nBits i32)
    (param $componentMask i32)
    (param $carryOverflowMask i32)

    (result i32)

    (local $w2 i32)
    (local $carryOverflow i32)
    (local $sum i32)
    (local $w1 i32)
    (local $b i32)

    local.get $word1
    local.get $carryOverflowMask
    i32.and
    local.set $w1

    local.get $word2
    local.get $carryOverflowMask
    i32.and
    local.set $w2

    local.get $word1
    local.get $w1
    i32.xor
    local.get $word2
    local.get $w2
    i32.xor
    i32.add
    local.set $sum

    local.get $w1
    local.get $w2
    i32.or
    local.get $sum
    i32.and
    local.get $w1
    local.get $w2
    i32.and
    i32.or
    local.set $carryOverflow

    local.get $sum
    local.get $w1
    i32.xor
    local.get $w2
    i32.xor

    local.get $carryOverflow
    local.get $nBits
    i32.const 1
    i32.sub
    i32.shr_u
    local.get $componentMask
    i32.mul
    i32.or)

  (func $partitionedAND (export "partitionedAND")
    (param $word1 i32)
    (param $word2 i32)
    (param $nBits i32)
    (param $nParts i32)

    (result i32)

    (local $result i32)
    (local $i i32)
    (local $mask i32)

    local.get $nBits
    i32.load16_s
    local.set $mask

    i32.const 0
    local.set $result

    i32.const 1
    local.set $i
    
    (loop $loop

    local.get $word1
    local.get $mask
    i32.and
    local.get $mask
    i32.eq

    (if
      (then
        local.get $word2
	local.get $mask
	i32.and
	local.get $result
	i32.or
	local.set $result))

    local.get $mask
    local.get $nBits
    i32.shl
    local.set $mask
    local.get $i
    i32.const 1
    i32.add
    local.set $i
    local.get $i
    local.get $nParts
    i32.le_u
    br_if $loop)

    local.get $result
    return)

  (func $partitionedSUB (export "partitionedSUB")
    (param $word1 i32)
    (param $word2 i32)
    (param $nBits i32)
    (param $nParts i32)

    (result i32)

    (local $p2 i32)
    (local $result i32)
    (local $p1 i32)
    (local $i i32)
    (local $mask i32)

    local.get $nBits
    i32.load16_s
    local.set $mask

    i32.const 0
    local.set $result

    i32.const 1
    local.set $i
    
    (loop $loop
    local.get $word1
    local.get $mask
    i32.and
    local.set $p1
    local.get $word2
    local.get $mask
    i32.and
    local.set $p2
    local.get $p1
    local.get $p2
    i32.lt_u
    (if
      (then
        local.get $result
	local.get $p2
	local.get $p1
	i32.sub
	i32.or
	local.set $result)
      (else
        local.get $result
	local.get $p1
	local.get $p2
	i32.sub
	i32.or
	local.set $result))
     local.get $mask
     local.get $nBits
     i32.shl
     local.set $mask
     local.get $i
     local.get $nParts
     i32.le_u
     br_if $loop)
     local.get $result
     return)

  (func $alphaBlendWithWASM (export "alphaBlendWithWASM")
    (param $sourceWord i32)
    (param $destinationWord i32)

    (result i32)

    (local $unAlpha i32)
    (local $blendRB i32)
    (local $blendAG i32)
    (local $result i32)
    (local $alpha i32)

    local.get $sourceWord
    i32.const 24
    i32.shr_u
    local.set $alpha
    local.get $alpha
    i32.const 0
    i32.eq

    (if
      (then
        local.get $destinationWord
	return))

    local.get $alpha
    i32.const 255
    i32.eq

    (if
      (then
        local.get $sourceWord
	return))

    i32.const 255
    local.get $alpha
    i32.sub
    local.set $unAlpha

    local.get $sourceWord
    i32.const 16711935
    i32.and
    local.get $alpha
    i32.mul
    local.get $destinationWord
    i32.const 16711935
    i32.and
    local.get $unAlpha
    i32.mul
    i32.add
    i32.const 16711935
    i32.add
    local.set $blendRB

    local.get $sourceWord
    i32.const 8
    i32.shr_u
    i32.const 16711680
    i32.or
    i32.const 16711935
    i32.and
    local.get $alpha
    i32.mul
    local.get $destinationWord
    i32.const 8
    i32.shr_u
    i32.const 16711935
    i32.and
    local.get $unAlpha
    i32.mul
    i32.add
    i32.const 16711935
    i32.add
    local.set $blendAG

    local.get $blendRB
    local.get $blendRB
    i32.const 65537
    i32.sub
    i32.const 8
    i32.shr_u
    i32.const 16711935
    i32.and
    i32.add
    i32.const 8
    i32.shr_u
    i32.const 16711935
    i32.and
    local.set $blendRB

    local.get $blendAG
    local.get $blendAG
    i32.const 65537
    i32.sub
    i32.const 8
    i32.shr_u
    i32.const 16711935
    i32.and
    i32.add
    i32.const 8
    i32.shr_u
    i32.const 16711935
    i32.and
    local.set $blendAG

    local.get $blendRB
    local.get $blendAG
    i32.const 8
    i32.shl
    i32.or
    local.set $result
    local.get $result
    return))

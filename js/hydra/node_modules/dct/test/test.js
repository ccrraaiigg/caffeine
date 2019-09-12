var assert = require('assert'),
    dct = require('../');

describe('DCT-2', function () {
    describe('1,0,1,0', function () {
        it('Should properly compute [1,0,1,0]', function () {
            var coef = dct([1,0,1,0]);

            assert(equalWithThresh(coef[0], 4, 0.01));
            assert(equalWithThresh(coef[1], 1.082392, 0.01));
            assert(equalWithThresh(coef[2], 0, 0.01));
            assert(equalWithThresh(coef[3], 2.613126, 0.01));
        });
    }); 

    describe('1,1,1,1,1,1', function () {
        it('Should properly compute [1,1,1,1,1,1]', function () {
            var coef = dct([1,1,1,1,1,1]);

            assert(equalWithThresh(coef[0], 12, 0.01));
            assert(equalWithThresh(coef[1], 0, 0.01));
            assert(equalWithThresh(coef[2], 0, 0.01));
            assert(equalWithThresh(coef[3], 0, 0.01));
            assert(equalWithThresh(coef[4], 0, 0.01));
            assert(equalWithThresh(coef[5], 0, 0.01));
        });
    });
    
    describe('2,0.5,0.1,5', function () {
        it('Should properly compute [2,0.5,0.1,5]', function () {
            var coef = dct([2,0.5,0.1,5]);

            assert(equalWithThresh(coef[0], 15.2, 0.01));
            assert(equalWithThresh(coef[1], -5.24, 0.01));
            assert(equalWithThresh(coef[2], 9.05, 0.01));
            assert(equalWithThresh(coef[3], -3.04, 0.01));
        });
    });

});

function equalWithThresh(val1, val2, threshold) {
    return (val1 > val2 - threshold) && 
           (val1 < val2 + threshold);
};

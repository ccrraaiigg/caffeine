var dct = require('./');

process.stdin.on('data', function (data) {
    var coef = dct(data.toString().split(','));
    console.log(coef);
});

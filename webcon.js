const path = require('path');

module.exports = {
    entry: './src/scripts.js',
    output: {
        filename: 'signing.js', 
        path: path.resolve(__dirname, 'dist'),
    },
    mode: 'development', 
};

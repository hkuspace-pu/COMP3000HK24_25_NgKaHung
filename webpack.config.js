const path = require('path');

module.exports = {
    entry: './signingfunction.mjs',
    output: {
        filename: 'signing.js', 
        path: path.resolve(__dirname, 'dist'), 
    },
    mode: 'development',
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
        }
    }
};


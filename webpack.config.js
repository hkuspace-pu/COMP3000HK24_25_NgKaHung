const path = require('path');

module.exports = {
    entry: './testButton.mjs',
    output: {
        filename: 'testButton.js', 
        path: path.resolve(__dirname, 'dist'), 
    },
    mode: 'development',
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
        }
    }
};


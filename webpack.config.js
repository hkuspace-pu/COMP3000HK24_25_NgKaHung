const path = require('path');

module.exports = {
    entry: './kemfunctionForWebAssem.mjs',
    output: {
        filename: 'kyber.js', 
        path: path.resolve(__dirname, 'dist'), 
    },
    mode: 'development',
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
        }
    }
};


const path = require('path');

module.exports = {
    entry: './testButtonWebAssembly.mjs',
    output: {
        filename: 'testButtonWebAssembly.js', 
        path: path.resolve(__dirname, 'dist'), 
    },
    mode: 'development',
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer/"),
        }
    }
};


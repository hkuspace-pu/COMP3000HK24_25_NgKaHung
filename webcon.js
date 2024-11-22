const path = require('path');

module.exports = {
    entry: './src/scripts.js', // 您的入口文件
    output: {
        filename: 'bundle.js', // 打包後的文件名
        path: path.resolve(__dirname, 'dist'), // 輸出目錄
    },
    mode: 'development', // 或 'production'
};

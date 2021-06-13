const path = require('path');

module.exports = {
    entry: './index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
  
    module: {
        rules: [
            {
                test: /\.(j|t)s$/,
                use: [
                    {
                        loader: 'babel-loader'
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true
                        }
                    }
                ],
                exclude: [
                    /node_modules/,
                    path.resolve(__dirname, '..', 'dist')
                ]
            }
        ]
    },
    mode: 'production'
};

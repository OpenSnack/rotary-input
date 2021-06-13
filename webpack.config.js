const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'rotary-input.js',
        library: {
            name: 'RotaryInput',
            type: 'umd',
            umdNamedDefine: true,
            export: 'default'
        }
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
                exclude: /node_modules/
            },
            {
                test: /\.s?css$/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js', '.css']
    },
    mode: 'production'
};

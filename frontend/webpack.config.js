const path = require('path');
module.exports = {
  entry: './src/index.js',
  output: { path: path.resolve(__dirname, 'dist'), filename: 'bundle.js' },
  module: { rules: [{ test:/\.js$/, exclude:/node_modules/, use:{ loader:'babel-loader', options:{ presets:['@babel/preset-react'] } } }] },
  devServer:{ static:'./dist', port:3000, hot:true },
  mode:'development'
};

var HTMLWebpackPlugin = require('html-webpack-plugin');

var HTMLWebpackPluginConfig = new HTMLWebpackPlugin({
   template: __dirname + '/src/index.html',
   filename: 'index.html',
   inject: 'body'
});

module.exports = {
   entry: __dirname + '/src/index.js',
   module: {
      loaders: [
         {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
         },
		 {
            test: /\.html$/,
            exclude: /node_modules/,
            loader: 'raw-loader'
         }
      ]
   },
   resolve: {
      extensions: ['.js', '.jsx'],
   },
   output: {
      filename: 'js/index.js',
      path: __dirname + '/build'
   },
   plugins: [
	  HTMLWebpackPluginConfig,
   ]
};

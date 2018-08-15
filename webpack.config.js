var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
module.exports = {
  entry: {
    main: './src/assets/build.js'
  },
  output: {
    path: __dirname + '/dist/js',
    filename: 'build.js'
  },
  // externals: {
  //   'jquery': "$"
  // },
  module: {
    rules: [{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader"
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader', 'sass-loader']
        })
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "../images/[name].[ext]"
          }
        }
      },
      {
        test: /\.(ttf|eot|woff|woff2|svg)$/,
        use: {
          loader: "file-loader",
          options: {
            name: "../fonts/[name].[ext]",
          },
        },
      },
      {
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            minimize: true
          }
        }],
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin("../css/styles.css"),
    new HtmlWebpackPlugin({
      filename: __dirname + '/dist/index.html',
      template: __dirname + '/src/index.html'
    }),
    // new webpack.ProvidePlugin({
    //   $: 'jquery'
    // }),


    /*------------------------------------------------------*
    提取main,user两个branch的公共代码放入common.js中（方法一）
    *-------------------------------------------------------*/
    // new webpack.optimize.CommonsChunkPlugin("common.js", ["main"]),



    /*------------------------------------------------------*
    提取main,user两个branch的公共代码放入common.js中（推荐方法）
    *-------------------------------------------------------*/
    // new webpack.optimize.CommonsChunkPlugin({
    //   name:"common",
    //   chunks:["main","user"]
    // })
  ]
}

var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const uglify = require('uglifyjs-webpack-plugin');
const optimizeCss = require('optimize-css-assets-webpack-plugin');
var webpack = require('webpack');


module.exports = {
  entry: {
    main: './src/assets/build.js'
  },
  output: {
    path: __dirname + '/dist/js',
    filename: '[name].js'
  },


  /*------------------------------------------------------*
  当使用<script src='jquery.js'></script>的方式引用jquery的时候
  不需要将引用的jquery进行打包，可以用externals的配置
  *-------------------------------------------------------*/
  // externals: {
  //   'jquery': "$"
  // },


  module: {
    rules: [{
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: {
            loader: "css-loader",
            options: {
              minimize: true
            }
          }
        })
      },
      {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [{
            loader: 'css-loader',
            options: {
              minimize: true
            }
          }, 'sass-loader']
        }),
      },
      {
        test: /\.(png|jpg|gif)$/,
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


  optimization: {


    /*------------------------------------------------------*
    将所用从node_module里面引用的内容打包成vendor.js
    *-------------------------------------------------------*/
    splitChunks: {
      cacheGroups: {
        commons: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all'
        }
      }
    },


    /*------------------------------------------------------*
    压缩css
    *-------------------------------------------------------*/
    minimizer: [new optimizeCss({})]
  },


  plugins: [
    new ExtractTextPlugin("../css/styles.css"),
    new HtmlWebpackPlugin({
      filename: __dirname + '/dist/index.html',
      template: __dirname + '/src/index.html'
    }),


    /*------------------------------------------------------*
    压缩css
    *-------------------------------------------------------*/
    new optimizeCss({
      assetNameRegExp: /\.style\.css$/g,
      cssProcessor: require('cssnano'),
      cssProcessorOptions: {
        discardComments: {
          removeAll: true
        }
      },
      canPrint: true
    }),


    /*------------------------------------------------------*
    压缩js
    *-------------------------------------------------------*/
    new uglify()


    /*------------------------------------------------------*
    将‘$’作为全局jquery使用，这样就不用require(jquery)了
    *-------------------------------------------------------*/
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

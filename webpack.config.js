var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
const uglify = require('uglifyjs-webpack-plugin');
const optimizeCss = require('optimize-css-assets-webpack-plugin');
var webpack = require('webpack');
const FileManegerPlugin = require('filemanager-webpack-plugin');
const OptimizeCssnanoPlugin = require('@intervolga/optimize-cssnano-plugin');
const MergeIntoSingleFilePlugin = require('webpack-merge-and-include-globally');


module.exports = {
  entry: {
    main: './cdn.js'
  },
  output: {
    path: __dirname + '/dist',
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
    rules: [
      {
        test: /\.css$/,
        use:ExtractTextPlugin.extract({
            fallback:"style-loader",
            use:[{
              loader:"css-loader"
            }]
        })
      },
      {
        test: /\.scss$/,
        use:ExtractTextPlugin.extract({
            fallback:"style-loader",
            use:[{
                loader:"css-loader"
            },{
                loader:"sass-loader"
            }]
        })
      },
      {
        test: /\.(png|jpe?g|gif|svg|woff|woff2|ttf|eot|ico)/,
        use: {
          loader: "file-loader",
          options: {
            name: "./images/[name].[ext]"
          }
        }
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
          name: 'vendor.min',
          chunks: 'all'
        }
      }
    },


    /*------------------------------------------------------*
    压缩css
    *-------------------------------------------------------*/
    // minimizer: [new optimizeCss({})]
  },


  plugins: [
    new ExtractTextPlugin('./style.css'),
    new OptimizeCssnanoPlugin({
      sourceMap: null,
      cssnanoOptions: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
        }],
      },
    }),

    // new HtmlWebpackPlugin({
    //   filename: __dirname + '/dist/index.html',
    //   template: __dirname + '/src/index.html'
    // }),
    new FileManegerPlugin({
        onStart: {
            delete: [
                'dist/'
            ]
        },
        onEnd: {
            // copy: [{
            //     source: 'node_modules/jquery-ui-dist/images',
            //     destination: '.cdn/images'
            // }]
        }
    }),


    /*------------------------------------------------------*
    压缩css
    *-------------------------------------------------------*/
    // new optimizeCss({
    //   assetNameRegExp: /\.style\.css$/g,
    //   cssProcessor: require('cssnano'),
    //   cssProcessorOptions: {
    //     discardComments: {
    //       removeAll: true
    //     }
    //   },
    //   canPrint: true
    // }),


    /*------------------------------------------------------*
    压缩js
    *-------------------------------------------------------*/
    new uglify(),


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


    /*------------------------------------------------------*
    将依赖文件打包到vendor里面
    *-------------------------------------------------------*/
    new MergeIntoSingleFilePlugin({
        // Create vendor.min.js and vendor.min.css file (concat all dist files into one file)
        files: {
            "vendor.min.js": [
                'node_modules/jquery/dist/jquery.min.js',
                'node_modules/jquery-ui-dist/jquery-ui.min.js',
                'node_modules/jquery-ui-touch-punch-amd/jquery.ui.touch-punch.min.js',
                'node_modules/popper.js/dist/umd/popper.min.js',
                'node_modules/bootstrap/dist/js/bootstrap.min.js',
                'node_modules/d3/dist/d3.min.js',
                'node_modules/sortablejs/Sortable.min.js',
            ],
            "vendor.min.css": [
                'node_modules/bootstrap/dist/css/bootstrap.min.css',
                'node_modules/jquery-ui-dist/jquery-ui.min.css',
            ]
        }
    }),
  ]
}

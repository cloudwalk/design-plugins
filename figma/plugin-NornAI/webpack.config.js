const HtmlWebpackPlugin = require('html-webpack-plugin');
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin');
const path = require('path');

module.exports = (env, argv) => ({
  mode: argv.mode === 'production' ? 'production' : 'development',

  // Desabilitando source maps em produção
  devtool: argv.mode === 'production' ? false : 'inline-source-map',

  entry: {
    ui: './src/app/index.tsx',
    code: './src/plugin/controller.ts',
  },

  module: {
    rules: [
      // TypeScript
      { 
        test: /\.tsx?$/, 
        use: {
          loader: 'ts-loader',
          options: {
            compilerOptions: {
              module: 'esnext',
              moduleResolution: 'node',
              target: 'es5',
              downlevelIteration: true
            }
          }
        },
        exclude: /node_modules/
      },
      // CSS
      { 
        test: /\.css$/, 
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      // Assets
      {
        test: /\.(svg|png|jpg|gif|webp)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 10 * 1024 // 10kb - imagens menores serão inlined
          }
        }
      },
    ],
  },

  resolve: { 
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
    alias: {
      'react': 'preact/compat',
      'react-dom': 'preact/compat'
    }
  },

  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
    library: {
      name: '[name]',
      type: 'var',
      export: 'default'
    },
    environment: {
      arrowFunction: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      module: false
    },
    assetModuleFilename: 'assets/[hash][ext][query]'
  },

  // Configurações simplificadas para o Figma
  optimization: {
    minimize: argv.mode === 'production',
    splitChunks: false,
    runtimeChunk: false,
    // Importante para o Figma: evitar renomeação dinâmica
    moduleIds: 'named',
    chunkIds: 'named',
    mangleExports: false
  },

  target: ['web', 'es5'],

  plugins: [
    new HtmlWebpackPlugin({
      template: './src/app/index.html',
      filename: 'ui.html',
      chunks: ['ui'],
      cache: false,
      inject: 'body',
      scriptLoading: 'blocking',
      // Simplificando a minificação
      minify: argv.mode === 'production' ? {
        removeComments: true,
        collapseWhitespace: true
      } : false
    }),
    // Inline do script na página HTML
    new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/ui/])
  ],
});

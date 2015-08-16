/**
 * Import dependencies
 */
import Glue from 'glue';
import WebpackConnection from 'hapi-webpack-connection';
import Path from 'path';
import {Schema} from './data/schema';


/**
 * Define constants
 */
const APP_PORT = 3000;
const GRAPHQL_PORT = 8080;


/**
 * Setup App
 */
const App = WebpackConnection({
  entry: Path.resolve(__dirname, 'js', 'app.js'),
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel',
        query: {stage: 0, plugins: ['./build/babelRelayPlugin']}
      }
    ]
  },
  output: {filename: 'app.js', path: '/'},
  devServer: {
    contentBase: './public',
    proxy: {'/graphql': `http://localhost:${GRAPHQL_PORT}`},
    publicPath: '/js/',
    port: APP_PORT,
    stats: {
      chunks: false
    }
  }
});


/**
 * Define manifest
 */
const manifest = {
  connections: [App.connection, {port: GRAPHQL_PORT}],
  plugins: {
    'hapi-graphql': {
      query: {
        schema: Schema,
        pretty: true
      },
      route: {
        path: '/graphql'
      }
    }
  }
}


/**
 * Start servers
 */
Glue.compose(manifest, (error, server) => {
  if (error) {
    return console.error(error);
  }
  server.start(() => console.log('Server running at:', server.info.uri));
});

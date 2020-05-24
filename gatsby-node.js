/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */

//https://github.com/firebase/firebase-js-sdk/issues/2222#issuecomment-538072948
exports.onCreateWebpackConfig = ({
                                   stage,
                                   actions,
                                   getConfig
                                 }) => {
  if (stage === 'build-html') {
    actions.setWebpackConfig({
      externals: getConfig().externals.concat(function(context, request, callback) {
        const regex = /^@?firebase(\/(.+))?/;
        // exclude firebase products from being bundled, so they will be loaded using require() at runtime.
        if (regex.test(request)) {
          return callback(null, 'umd ' + request);
        }
        callback();
      })
    });
  }
};

exports.createPages = ({ actions }) => {
    const { createRedirect } = actions;

    createRedirect({ fromPath: '/game/*', toPath: '/game', statusCode: 200 });
}
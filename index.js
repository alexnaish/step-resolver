module.exports = Resolver;

function Resolver (resolvers) {

  var index = 0;

  return {
    attempt: function attempt () {
      var resolver = resolvers[index];
      return resolver.method.apply(resolver.context, arguments)
          .then(res => {
              if (res) {
                  if (resolver.after) {
                      return resolver.after(res);
                  }
                  return res;
              }
              if (!res && resolvers[index + 1]) {
                  index++;
                  return attempt.apply(null, arguments);
              }

              var error = new Error('Unable to resolve');
              error.args = arguments;
              return Promise.reject(error);
          });
  }
  };

}

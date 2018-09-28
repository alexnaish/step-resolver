# step-resolver

> Simple, hierarchical promise resolver.

[![NPM Version][npm-image]][npm-url]
[![Build][travis-image]][travis-url]
[![Dependencies][david-image]][david-url]
[![Node Version][node-image]][node-url]


## Install

```bash
npm install -S step-resolver
or
yarn add step-resolver

```

## Usage

On several occasions I had the requirement of querying one store, if no result then querying the next and so on. A real example would be checking a memory cache, falling back to a database, falling back to a long-term filestorage system etc.

All functions are expected to return a promise and have the supplied arguments applied.

### Sample Usage

The below example is one way of performing the above functionality, cache first, then database, then third party API. The after attributes of each resolver define what should happen if the method returns a truthy value. For instance, the cache resolver does not have an after function as there is no need, however if the cache resolver returns null and the database resolver returns a value, the after function of the database resolver could be to update the cache with the returned result.

```
const resolvers = [
    {
        method: cache.get
    },
    {
        method: (id, options) => {
            const newOptions = Object.assign(options, { authKey: process.env.SECRET_KEY });
            return database.fetch({ _id: id }, newOptions);
        },
        after: (result, { args }) => cache.set(args[0], result)
    },
    {
        method: service.fetchFromThirdParty,
        after: (result, { args }) => {
            return Promise.all([
                cache.set(args[0], result),
                database.set(args[0], result)
            ]);
        }
    }
];

const myResolver = Resolver(resolvers);
const result = await myResolver.attempt(id, options);

```

### Logic

*  All resolver functions will be applied with the same parameters that `attempt` is called with.
*  If any resolver throws an error, the step-resolver will immediately reject with the error.
*  If all resolver functions have completed and there is still no result found, step-resolver will resolve with null.
*  If any resolver function resolves with a value, step-resolver will call the `after` function (if present) and return the result. An additional parameter is passed to the function allowing it access to the supplied arguments (as per example).

## License

MIT

[npm-image]: https://img.shields.io/npm/v/step-resolver.svg
[npm-url]: https://npmjs.org/package/step-resolver
[travis-image]: https://travis-ci.org/alexnaish/step-resolver.svg?branch=master
[travis-url]: https://travis-ci.org/alexnaish/step-resolver
[david-image]: https://img.shields.io/david/alexnaish/step-resolver.svg
[david-url]: https://david-dm.org/alexnaish/step-resolver
[node-image]: https://img.shields.io/node/v/step-resolver.svg
[node-url]: https://nodejs.org



# step-resolver

> Simple, hierarchical promise resolver.

[![NPM Version][npm-image]][npm-url]
[![Build][circle-image]][circle-url]

## Install

```bash
npm install -S step-resolver
or
yarn add step-resolver

```

## Usage

On several occasions I had the requirement of querying one store, if no result then querying the next and so on. A real example would be checking a memory cache, falling back to a database, falling back to a long-term filestorage system etc.

### Sample Usage

The below example is one way of performing the above functionality, cache first, then database, then third party API. The after attributes of each resolver define what should happen if the method returns a truthy value. For instance, the cache resolver does not have an after function as there is no need, however if the cache resolver returns null and the database resolver returns a value, the after function of the database resolver could be to update the cache with the returned result.

```
const resolvers = [
    {
        method: cache.get
    },
    {
        method: (query, options) => {
            const newOptions = Object.assign(options, { authKey: process.env.SECRET_KEY });
            return database.fetch(args, newOptions);
        },
        after: cache.set
    },
    {
        method: service.fetchFromThirdParty,
        after: (result) => {
            return Promise.all([
                cache.set(result),
                database.set(result)
            ]);
        }
    }
];

const myResolver = Resolver(resolvers);
const result = await myResolver.attempt(some, arguments, here);

```


## License

MIT

[npm-image]: https://img.shields.io/npm/v/step-resolver.svg
[npm-url]: https://npmjs.org/package/step-resolver
[circle-image]: https://img.shields.io/circle/live-js/step-resolver/master.svg
[circle-url]: https://circle-ci.org/live-js/step-resolver

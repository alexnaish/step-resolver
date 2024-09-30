type Awaitable<T> = T | Promise<T>;

export type ResolverStep<T extends any, R extends any> = {
    method: (props: T) => Awaitable<R | null | undefined>;
    after?: (result: R, { args }: { args: T }) => Awaitable<R>;
}

const internalAttempt = async <T, R>(resolvers: ResolverStep<T, R>[], props: T, i = 0): Promise<R | null | undefined> => {
    const resolver = resolvers[i];
    const res = await resolver.method(props)
    if (res) {
        return resolver.after ? resolver.after(res, { args: props }) : res;
    }
    const next = i + 1;
    if (resolvers[next]) {
        return internalAttempt(resolvers, props, next);
    }

    return Promise.resolve(null);
}

class Resolver<T, R> {
    private resolvers: ResolverStep<T, R>[];

    constructor(resolvers: ResolverStep<T, R>[]) {
        this.resolvers = resolvers;
    }

    attempt(props: T) {
        return internalAttempt(this.resolvers, props, 0);
    }

}

export default Resolver;

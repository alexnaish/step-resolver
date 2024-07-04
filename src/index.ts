type ResolverStep<T extends any> = {
    method: (props: T) => Promise<unknown> | unknown;
    after?: (result: unknown, { args }: { args: T }) => any;
}

const internalAttempt = async <T>(resolvers: ResolverStep<T>[], props: T, i = 0): Promise<unknown> => {
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

class Resolver<T> {
    private resolvers: ResolverStep<T>[];

    constructor(resolvers: ResolverStep<T>[]) {
        this.resolvers = resolvers;
    }

    attempt(props: T) {
        return internalAttempt(this.resolvers, props, 0);
    }

}

export default Resolver;

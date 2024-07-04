import { jest, describe, expect, it, beforeEach } from '@jest/globals';
import Resolver from '../src/';

describe('Resolver', () => {
    const mockArgs = 'test';
    const mockResponse = 'response';
    const firstResolver = {
        method: jest.fn<any>().mockResolvedValue(mockResponse)
    };
    const nextResolver = {
        method: jest.fn<any>().mockResolvedValue(mockResponse)
    };
    const lastResolver = {
        method: jest.fn<any>().mockResolvedValue(mockResponse)
    };
    const resolvers = [
        firstResolver,
        nextResolver,
        lastResolver
    ];
    const myResolver = new Resolver(resolvers);

    beforeEach(() => {
        firstResolver.method.mockClear();
        nextResolver.method.mockClear();
        lastResolver.method.mockClear();
    });

    describe('Logic', () => {

        describe('when first resolver returns a value', () => {

            it('should return response after first resolver check', async () => {
                const res = await myResolver.attempt(mockArgs);
                expect(res).toEqual(mockResponse);
                expect(firstResolver.method.mock.calls.length).toEqual(1);
            });

            it('should not attempt to call subsequent resolvers', async () => {
                await myResolver.attempt(mockArgs)
                expect(nextResolver.method.mock.calls.length).toEqual(0);
                expect(lastResolver.method.mock.calls.length).toEqual(0);
            });

        });

        describe('when first returns null and second resolver returns a value', () => {

            beforeEach(() => {
                firstResolver.method.mockResolvedValue(null);
            });

            it('should return response after second resolver check', async () => {
                const res = await myResolver.attempt(mockArgs);

                expect(res).toEqual(mockResponse);
                expect(firstResolver.method.mock.calls.length).toEqual(1);
                expect(nextResolver.method.mock.calls.length).toEqual(1);
            });

            it('should not attempt to call subsequent resolvers', async () => {
                await myResolver.attempt(mockArgs);
                expect(lastResolver.method.mock.calls.length).toEqual(0);
            });

        });

        describe('when first and second return null and third resolver returns a value', () => {

            beforeEach(() => {
                firstResolver.method.mockResolvedValue(null);
                nextResolver.method.mockResolvedValue(null);
            });

            it('should return response after third resolver check', async () => {
                const res = await myResolver.attempt(mockArgs);

                expect(res).toEqual(mockResponse);
                expect(firstResolver.method.mock.calls.length).toEqual(1);
                expect(nextResolver.method.mock.calls.length).toEqual(1);
                expect(lastResolver.method.mock.calls.length).toEqual(1);
            });

        });

        describe('when no resolvers return a value', () => {

            beforeEach(() => {
                firstResolver.method.mockResolvedValue(null);
                nextResolver.method.mockResolvedValue(null);
                lastResolver.method.mockResolvedValue(null);
            });

            it('should resolve with null', async () => {
                const res = await myResolver.attempt(mockArgs);
                expect(res).toEqual(null);
            });

        });

        describe('when a resolvers throws an error', () => {

            var mockError = new Error('test error');
            beforeEach(() => {
                firstResolver.method.mockResolvedValue(null);
                nextResolver.method.mockRejectedValue(mockError);
                lastResolver.method.mockResolvedValue(null);
            });

            it('should reject with error', () => {
                return myResolver.attempt(mockArgs).catch(error => {
                    expect(error).toEqual(mockError);
                });
            });

        });

    });

    describe('after hooks', () => {
        const firstHook = jest.fn<any>().mockResolvedValue('first-value');
        const afterHook = jest.fn<any>().mockResolvedValue('second-value');
        const resolverWithHooks = new Resolver([
            {
                method: () => null,
                after: firstHook
            },
            {
                method: () => mockResponse,
                after: afterHook
            }
        ])

        it('should only be called if resolver returns a value', async () => {
            const res = await resolverWithHooks.attempt(mockArgs);
            expect(firstHook).not.toBeCalled();
            expect(afterHook).toBeCalledWith(mockResponse, { args: mockArgs });
            expect(res).toEqual('second-value');
        });

    });

});

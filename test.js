const expect = require('chai').expect;
const sinon = require('sinon');
const Resolver = require('./index');

describe('Resolver', () => {

    const mockArgs = 'test';
    const mockResponse = 'response';
    let resolvers = [];
    let firstResolver;
    let nextResolver;
    let lastResolver;
    let myResolver;

    beforeEach(() => {

        firstResolver = {
            method: sinon.stub().resolves(mockResponse)
        };
        nextResolver = {
            method: sinon.stub().resolves(mockResponse)
        };
        lastResolver = {
            method: sinon.stub().resolves(mockResponse)
        };

        resolvers = [
            firstResolver,
            nextResolver,
            lastResolver
        ];

        myResolver = Resolver(resolvers);
    });

    describe('Logic', () => {

        context('when first resolver returns a value', () => {

            it('should return response after first resolver check', () => {
                return myResolver.attempt(mockArgs).then(res => {
                    expect(res).to.equal(mockResponse);
                    expect(firstResolver.method.calledWith(mockArgs)).to.equal(true);
                });
            });

            it('should not attempt to call subsequent resolvers', () => {
                return myResolver.attempt(mockArgs).then(res => {
                    expect(nextResolver.method.called).to.equal(false);
                    expect(lastResolver.method.called).to.equal(false);
                });
            });

        });

        context('when first returns null and second resolver returns a value', () => {

            beforeEach(() => {
                firstResolver.method.resolves(null);
                myResolver = Resolver(resolvers);
            });

            it('should return response after second resolver check', () => {
                return myResolver.attempt(mockArgs).then(res => {
                    expect(res).to.equal(mockResponse);
                    expect(firstResolver.method.calledWith(mockArgs)).to.equal(true);
                    expect(nextResolver.method.calledWith(mockArgs)).to.equal(true);
                });
            });

            it('should not attempt to call subsequent resolvers', () => {
                return myResolver.attempt(mockArgs).then(res => {
                    expect(lastResolver.method.called).to.equal(false);
                });
            });

        });

        context('when first and second return null and third resolver returns a value', () => {

            beforeEach(() => {
                firstResolver.method.resolves(null);
                nextResolver.method.resolves(null);
                myResolver = Resolver(resolvers);
            });

            it('should return response after third resolver check', () => {
                return myResolver.attempt(mockArgs).then(res => {
                    expect(res).to.equal(mockResponse);
                    expect(firstResolver.method.calledWith(mockArgs)).to.equal(true);
                    expect(nextResolver.method.calledWith(mockArgs)).to.equal(true);
                    expect(lastResolver.method.calledWith(mockArgs)).to.equal(true);
                });
            });

        });

        context('when no resolvers return a value', () => {

            beforeEach(() => {
                firstResolver.method.resolves(null);
                nextResolver.method.resolves(null);
                lastResolver.method.resolves(null);
                myResolver = Resolver(resolvers);
            });

            it('should return a rejected promise', () => {
                return myResolver.attempt(mockArgs).catch(res => {
                    expect(res).to.be.an('error');
                    expect(res).to.have.property('args');
                    expect(res.args[0]).to.equal(mockArgs);
                });
            });

        });

    });

    describe('after hooks', () => {

        beforeEach(() => {
            firstResolver.method.resolves(null);
            firstResolver.after = sinon.stub().resolves({});
            nextResolver.method.resolves(mockResponse);
            nextResolver.after = sinon.stub().resolves('afterResponse');
            lastResolver.after = sinon.stub().resolves({});
            myResolver = Resolver(resolvers);
        });

        it('should only be called if resolver returns a value', () => {
            return myResolver.attempt(mockArgs).then(res => {
                expect(res).to.equal('afterResponse');
                expect(firstResolver.after.called).to.equal(false);
                expect(nextResolver.after.calledWith(mockResponse)).to.equal(true);
                expect(lastResolver.after.called).to.equal(false);
            });
        });

    });

});

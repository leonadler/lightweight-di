import { InjectionError } from './injection-error';
import { expect } from 'chai';

describe('InjectionError', () => {

    it('has the correct Prototype chain', () => {
        const err = new InjectionError('message', 'token');
        expect(err).to.be.an.instanceof(InjectionError);
        expect(err).to.be.an.instanceof(Error);
    });

    it('copies the passed message to the "message" property', () => {
        const err = new InjectionError('some message', 'token');
        expect(err.message).to.equal('some message');
    });

    it('copies the passed token to the "token" property', () => {
        const token = { name: 'some token' };
        const err = new InjectionError('message', token);
        expect(err.token).to.equal(token);
    });

    it('has a stack trace', () => {
        const err = new InjectionError('message', 'token');
        expect(err.stack).to.be.a('string').and.not.to.equal('');
    });

    it('limits the stack trace (if supported by the execution environment)', function () {
        if (!Error.captureStackTrace) {
            this.skip();
        }

        function functionThatThrows() {
            throw new InjectionError('message', 'token');
        }

        try {
            functionThatThrows();
        } catch (err) {
            expect(err.stack).to.match(/message\n    at functionThatThrows /);
        }
    });

    it('sets its "name" property', () => {
        const err = new InjectionError('some message', 'token');
        expect(err.name).to.equal('InjectionError');
    });

});

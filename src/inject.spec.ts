import 'reflect-metadata';
import { expect } from 'chai';
import { Inject } from './inject';


describe('@Inject', () => {

    it('stores injection tokens when called with a value', () => {
        class TestClass {
            constructor(@Inject('token to use') arg: string) { }
        }

        const metadata = Reflect.getMetadata('di-tokens', TestClass);
        expect(metadata).to.deep.equal(['token to use']);
    });

    it('derives the injection token from TypeScript types when called without a value', () => {
        class Dependency { }
        class TestClass {
            constructor(@Inject arg: Dependency) { }
        }

        const metadata = Reflect.getMetadata('di-tokens', TestClass);
        expect(metadata).to.deep.equal([Dependency]);
    });

    it('can be mixed "with value" and "without value"', () => {
        class Dependency { }
        class TestClass {
            constructor(first: Dependency, @Inject('token to use') second: string) { }
        }

        const metadata = Reflect.getMetadata('di-tokens', TestClass);
        expect(metadata).to.deep.equal([Dependency, 'token to use']);
    });

});

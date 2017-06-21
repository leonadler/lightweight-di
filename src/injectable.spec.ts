import 'reflect-metadata';
import { expect } from 'chai';
import { Inject } from './inject';
import { Injectable } from './injectable';


describe('@Injectable', () => {

    it('stores injection tokens for constructor parameters', () => {
        class Dependency { }

        @Injectable
        class TestClass {
            constructor(arg: Dependency) { }
        }

        const metadata = Reflect.getMetadata('di-tokens', TestClass);
        expect(metadata).to.deep.equal([Dependency]);
    });

    it('works for constructors with no parameters', () => {
        @Injectable
        class TestClass {
            constructor() { }
        }

        const metadata = Reflect.getMetadata('di-tokens', TestClass);
        expect(metadata).to.deep.equal([]);
    });

    it('works for classes with no explicit constructor', () => {
        @Injectable
        class TestClass { }

        const metadata = Reflect.getMetadata('di-tokens', TestClass);
        expect(metadata).to.deep.equal([]);
    });

    it('works with @Inject', () => {
        class Dependency { }

        @Injectable
        class TestClass {
            constructor(first: Dependency, @Inject('token to use') second: string) { }
        }

        const metadata = Reflect.getMetadata('di-tokens', TestClass);
        expect(metadata).to.deep.equal([Dependency, 'token to use']);
    });

});

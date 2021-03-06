import { expect } from 'chai';
import { Inject } from './inject';
import { Injectable } from './injectable';
import { Injector } from './injector';
import { InjectionToken } from './injection-token';


describe('Injector', () => {

    describe('autoResolveAndCreate()', () => {

        it('can be created with providers', () => {
            class FirstDependency { }
            class SecondDependency { }

            const injector = Injector.autoResolveAndCreate([FirstDependency, SecondDependency]);
            expect(injector).not.to.be.undefined;
        });

        it('can be created with no providers', () => {
            const injector = Injector.autoResolveAndCreate([])
            expect(injector).not.to.be.undefined;
        });

        it('can be created regardless of the order of the providers array', () => {
            class Dependency { }
            class ClassWithDependency {
                constructor(@Inject dep: Dependency) { }
            }

            let injector = Injector.autoResolveAndCreate([Dependency, ClassWithDependency])
            expect(injector).not.to.be.undefined;
            expect(() => injector.get(ClassWithDependency)).not.to.throw();
            expect(() => injector.get(Dependency)).not.to.throw();

            injector = Injector.autoResolveAndCreate([ClassWithDependency, Dependency])
            expect(injector).not.to.be.undefined;
            expect(() => injector.get(ClassWithDependency)).not.to.throw();
            expect(() => injector.get(Dependency)).not.to.throw();
        });

        it('does not throw when a dependency is not provided', () => {
            class ImplicitDependency { }
            class TestProvider {
                constructor(@Inject dep: ImplicitDependency) { }
            }

            const create = () => Injector.autoResolveAndCreate([TestProvider]);
            expect(create).not.to.throw('No provider');
        });

        it('automatically creates factories for class dependencies', () => {
            class ThirdDependency {
            }
            class SecondDependency {
                constructor(@Inject public third: ThirdDependency) { }
            }
            class FirstDependency {
                constructor(@Inject public second: SecondDependency) { }
            }
            class TestProvider {
                constructor(@Inject public first: FirstDependency) { }
            }

            const injector = Injector.autoResolveAndCreate([TestProvider]);
            expect(injector).not.to.be.undefined;

            const instance = injector.get(TestProvider);
            expect(instance).not.to.be.undefined;
            expect(instance.first).to.be.instanceof(FirstDependency);
            expect(instance.first.second).to.be.instanceof(SecondDependency);
            expect(instance.first.second.third).to.be.instanceof(ThirdDependency);
            expect(instance.first.second.third).to.equal(injector.get(ThirdDependency));
        });

        it('throws when InjectionToken dependencies are not provided', () => {
            const provided = new InjectionToken<number>('PI');
            const missing = new InjectionToken<string>('Language');

            class TestProvider {
                constructor(@Inject(provided) first: number, @Inject(missing) second: string) { }
            }

            function create() {
                return Injector.autoResolveAndCreate([
                    TestProvider,
                    { provide: provided, useValue: 3.141 }
                ]);
            }
            expect(create).to.throw('No provider for "Language".');
        });

        it('throws when the provided tokens contain a circular dependency tree (2)', () => {
            class ProviderA { }
            class ProviderB { }
            Inject(ProviderB)(ProviderA, undefined, 0);
            Inject(ProviderA)(ProviderB, undefined, 0);

            const create = () => Injector.autoResolveAndCreate([ProviderA, ProviderB]);
            expect(create).to.throw('Circular dependency');
        });

        it('throws when the provided tokens contain a circular dependency tree (3)', () => {
            class ProviderA { }
            class ProviderB { }
            class ProviderC { }
            Inject(ProviderB)(ProviderA, undefined, 0);
            Inject(ProviderC)(ProviderB, undefined, 0);
            Inject(ProviderA)(ProviderC, undefined, 0);

            const create = () => Injector.autoResolveAndCreate([ProviderA, ProviderB, ProviderC]);
            expect(create).to.throw('Circular dependency');
        });

    });

    describe('resolveAndCreate()', () => {

        it('can be created with providers', () => {
            class FirstDependency { }
            class SecondDependency { }

            const injector = Injector.resolveAndCreate([FirstDependency, SecondDependency]);
            expect(injector).not.to.be.undefined;
        });

        it('can be created with no providers', () => {
            const injector = Injector.resolveAndCreate([])
            expect(injector).not.to.be.undefined;
        });

        it('can be created regardless of the order of the providers array', () => {
            class Dependency { }
            class ClassWithDependency {
                constructor(@Inject dep: Dependency) { }
            }

            let injector = Injector.resolveAndCreate([Dependency, ClassWithDependency])
            expect(injector).not.to.be.undefined;
            expect(() => injector.get(ClassWithDependency)).not.to.throw();
            expect(() => injector.get(Dependency)).not.to.throw();

            injector = Injector.resolveAndCreate([ClassWithDependency, Dependency])
            expect(injector).not.to.be.undefined;
            expect(() => injector.get(ClassWithDependency)).not.to.throw();
            expect(() => injector.get(Dependency)).not.to.throw();
        });

        it('throws when a dependency is not provided', () => {
            class MissingDependency { }
            class TestProvider {
                constructor(@Inject dep: MissingDependency) { }
            }

            const create = () => Injector.resolveAndCreate([TestProvider]);
            expect(create).to.throw('No provider');
        });

        it('throws when the provided tokens contain a circular dependency tree (2)', () => {
            class ProviderA { }
            class ProviderB { }
            Inject(ProviderB)(ProviderA, undefined, 0);
            Inject(ProviderA)(ProviderB, undefined, 0);

            const create = () => Injector.resolveAndCreate([ProviderA, ProviderB]);
            expect(create).to.throw('Circular dependency');
        });

        it('throws when the provided tokens contain a circular dependency tree (3)', () => {
            class ProviderA { }
            class ProviderB { }
            class ProviderC { }
            Inject(ProviderB)(ProviderA, undefined, 0);
            Inject(ProviderC)(ProviderB, undefined, 0);
            Inject(ProviderA)(ProviderC, undefined, 0);

            const create = () => Injector.resolveAndCreate([ProviderA, ProviderB, ProviderC]);
            expect(create).to.throw('Circular dependency');
        });

    });

    describe('createChildInjector()', () => {

        it('creates an injector with factories for the tokens of the parent injector', () => {
            class TestService { }

            const parent = Injector.resolveAndCreate([TestService]);
            const child = parent.createChildInjector([]);
            const instance = child.get(TestService);

            expect(instance).to.be.an.instanceof(TestService);
        });

        it('creates new instances for tokens provided with the call', () => {
            class TestService { }

            const parent = Injector.resolveAndCreate([TestService]);
            const child = parent.createChildInjector([TestService]);
            const parentInstance = parent.get(TestService);
            const childInstance = child.get(TestService);

            expect(parentInstance).not.to.equal(childInstance);
            expect(childInstance).to.be.an.instanceof(TestService);
        });

        it('returns the same instances as the parent injector for all other tokens', () => {
            class TestService { }

            const parent = Injector.resolveAndCreate([TestService]);
            const child = parent.createChildInjector([]);
            const parentInstance = parent.get(TestService);
            const childInstance = child.get(TestService);

            expect(parentInstance).to.equal(childInstance);
            expect(childInstance).to.be.an.instanceof(TestService);
        });

        it('can be used to create a injector hierarchy', () => {
            class TestService { }

            const parent = Injector.resolveAndCreate([TestService]);
            const firstChild = parent.createChildInjector([TestService]);
            const secondChild = parent.createChildInjector([TestService]);
            const grandChild = secondChild.createChildInjector([]);
            const a = parent.get(TestService);
            const b = firstChild.get(TestService);
            const c = secondChild.get(TestService);
            const d = grandChild.get(TestService);

            expect(b).not.to.equal(a);
            expect(c).not.to.equal(b);
            expect(c).to.be.an.instanceof(TestService);
            expect(d).to.equal(c);
        });

        it('throws if created for tokens which are not provided in a parent injector', () => {
            class TestService { }

            const parent = Injector.resolveAndCreate([]);
            function create() {
                parent.createChildInjector([TestService]);
            }

            expect(create).to.throw('No provider for TestService');
        });

    });

    describe('get()', () => {

        describe('with classes', () => {

            it('creates and returns an instance', () => {
                class ClassToProvide {
                    isInUnitTest = true;
                }

                const injector = Injector.resolveAndCreate([ClassToProvide])
                const value = injector.get(ClassToProvide);
                expect(value).not.to.be.undefined;
                expect(value).to.have.property('isInUnitTest').which.is.true;
            });

            it('returns the same instance for consecutive calls', () => {
                class TestClass { }

                const injector = Injector.resolveAndCreate([TestClass])
                const first = injector.get(TestClass);
                const second = injector.get(TestClass);
                const third = injector.get(TestClass);

                expect(first).to.equal(second);
                expect(second).to.equal(third);
            });

            it('creates instances of class dependencies and passes them to the constructor', () => {
                class FirstDependency { }
                class SecondDependency { }

                @Injectable
                class TestClass {
                    constructor(public a: FirstDependency, public b: SecondDependency) { }
                }

                const injector = Injector.resolveAndCreate([FirstDependency, SecondDependency, TestClass]);
                const result = injector.get(TestClass);
                expect(result.a).to.be.an.instanceof(FirstDependency);
                expect(result.b).to.be.an.instanceof(SecondDependency);
            });

        });

        describe('with useClass hashes', () => {

            it('creates and returns an instance', () => {
                class ClassToProvide { }
                class ClassToUse { }

                const dependencies = [{ provide: ClassToProvide, useClass: ClassToUse }];
                const injector = Injector.resolveAndCreate(dependencies);

                expect(injector.get(ClassToProvide)).to.be.instanceof(ClassToUse);
            });

            it('does not use the provided class as token', () => {
                class RealDependency { }
                class MockDependency { }

                const dependencies = [{ provide: RealDependency, useClass: MockDependency }];
                const injector = Injector.resolveAndCreate(dependencies);

                expect(() => injector.get(RealDependency)).not.to.throw('No provider for RealDependency');
                expect(() => injector.get(MockDependency)).to.throw('No provider for MockDependency');
            });

            it('does not create an instance of the injection token class', () => {
                let realDependencyWasCreated = false;
                class RealDependency {
                    constructor() {
                        realDependencyWasCreated = true;
                    }
                }
                class MockDependency { }

                const dependencies = [{ provide: RealDependency, useClass: MockDependency }];
                const injector = Injector.resolveAndCreate(dependencies);
                injector.get(RealDependency);

                expect(realDependencyWasCreated).to.be.false;
            });

            it('creates the provided class with its dependencies', () => {
                class AbstractBaseClass { }
                class ImplementationDependency { }

                class Implementation {
                    constructor(@Inject public dep: ImplementationDependency) { }
                }

                const injector = Injector.resolveAndCreate([
                    { provide: AbstractBaseClass, useClass: Implementation },
                    ImplementationDependency
                ]);

                const instance = injector.get<Implementation>(AbstractBaseClass);
                expect(instance).to.to.be.instanceof(Implementation);
                expect(instance.dep).to.to.be.instanceof(ImplementationDependency);
            });

            it('accepts and uses a "dependencies" array', () => {
                class ClassToProvide { }
                class ClassToUse {
                    constructor(public untypedDependency: any) { }
                }
                class Dependency { }

                const injector = Injector.resolveAndCreate([
                    Dependency,
                    { provide: ClassToProvide, useClass: ClassToUse, dependencies: [Dependency] }
                ]);

                const instance = injector.get<ClassToUse>(ClassToProvide);
                expect(instance).to.to.be.instanceof(ClassToUse);
                expect(instance.untypedDependency).to.to.be.instanceof(Dependency);
            });

        });

        describe('with useFactory hashes', () => {

            it('calls the factory and returns the result', () => {
                const factory = () => 'value returned by the factory';
                const token = new InjectionToken<string>('dependency');

                const dependencies = [{ provide: token, useFactory: factory }];
                const injector = Injector.resolveAndCreate(dependencies);

                expect(injector.get(token)).to.equal('value returned by the factory');
            });

            it('returns the same result when called multiple times', () => {
                let lastNumber = 1;
                const factory = () => {
                    return { counter: lastNumber++ };
                }
                const token = new InjectionToken('test token');

                const dependencies = [{ provide: token, useFactory: factory }];
                const injector = Injector.resolveAndCreate(dependencies);

                const first = injector.get(token);
                const second = injector.get(token);
                const third = injector.get(token);

                expect(first).to.equal(second);
                expect(second).to.equal(third);
            });

            it('accepts and uses a "dependencies" array', () => {
                let calledWith: any;
                const factory = (arg: any) => {
                    calledWith = arg;
                    return { };
                }
                const token = new InjectionToken('test token');
                class FactoryDependency { }

                const injector = Injector.resolveAndCreate([
                    FactoryDependency,
                    { provide: token, useFactory: factory, dependencies: [FactoryDependency] }
                ]);

                injector.get(token);
                expect(calledWith).to.be.instanceof(FactoryDependency);
            });

        });

        describe('with useValue hashes', () => {

            it('simply returns the provided value', () => {
                const token = new InjectionToken<string>('unit test token');
                const dependencies = [{ provide: token, useValue: 'a string to use' }];
                const injector = Injector.resolveAndCreate(dependencies);

                expect(injector.get(token)).to.equal('a string to use');
            });

            it('allows providing null', () => {
                const token = new InjectionToken<any>('unit test token');
                const dependencies = [{ provide: token, useValue: null }];
                const injector = Injector.resolveAndCreate(dependencies);

                expect(injector.get(token)).to.equal(null);
            });

            it('allows providing undefined', () => {
                const token = new InjectionToken<any>('unit test token');
                const dependencies = [{ provide: token, useValue: undefined }];
                const injector = Injector.resolveAndCreate(dependencies);

                expect(injector.get(token)).to.equal(undefined);
            });

            it('ignores passed dependencies', () => {
                let wasCalled = false;
                class NeedlessDependency {
                    constructor() {
                        wasCalled = true;
                    }
                }

                const token = new InjectionToken<any>('unit test token');
                const injector = Injector.resolveAndCreate([
                    { provide: token, useValue: undefined, dependencies: [NeedlessDependency] },
                    NeedlessDependency
                ]);
                injector.get(token);
                expect(wasCalled).to.be.false;
            });

        });

    });

});

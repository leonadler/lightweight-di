# API

## `@Injectable` decorator

Marks a class as injectable. Creating all parameters of the constructor
and creating instances of the class should be handled by the injector.

```typescript
@Injectable
class FileLogger {
    constructor(fs: FileSystem, formatter: StringFormatter) { }
    // ...
}
```

A class with no dependencies (constructor parameters) does not need to be decorated.


## `@Inject` decorator

Marks a parameter as injectable dependency. Can be used with `@Injectable`, but makes it redundant.

```typescript
class DataService {
    constructor(@Inject client: HttpClient) { }
}
```

An overload which accepts injection tokens is available:

```typescript
const environment = new InjectionToken('environment');

class Database {
    constructor(@Inject(environment) env: string) { }
}
```


## `Injector` class

Resolves and creates dependencies via the decorators above.

```typescript
const injector = Injector.resolveAndCreate([ClassWithDependencies, Dependency1, Dependency2]);
const instance = injector.get(ClassWithDependencies);
```

### `static autoResolveAndCreate(providers)`

Resolves a passed array of providers to a dependency tree. Class dependencies which are not
provided explicitly are resolved automatically, injection tokens must be provided.
Throws an exception for cyclic dependencies or missing token providers.

```typescript
class DependencyA {
}

class DependencyB {
    constructor(@Inject a: DependencyA) { }
}

class DependencyC {
    constructor(@Inject b: DependencyB) { }
}

const LANGUAGE = new InjectionToken<string>('LANGUAGE');

class App {
    constructor(@Inject c: DependencyC, @Inject(LANGUAGE) lang: string) { }
}

const injector = Injector.autoResolveAndCreate([
    App,
    { provide: LANGUAGE, useValue: 'en' }
]);
```


### `static resolveAndCreate(providers)`

Resolves a passed array of providers to a dependency tree. All dependencies and nested dependencies
must be provided explicitly. Throws an exception for cyclic dependencies or missing providers.

```typescript
class DependencyA {
}

class DependencyB {
    constructor(@Inject a: DependencyA) { }
}

class DependencyC {
    constructor(@Inject b: DependencyB) { }
}

const LANGUAGE = new InjectionToken<string>('LANGUAGE');

class App {
    constructor(@Inject c: DependencyC, @Inject(LANGUAGE) lang: string) { }
}

const injector = Injector.resolveAndCreate([
    App,
    DependencyA,
    DependencyB,
    DependencyC,
    { provide: LANGUAGE, useValue: 'en' }
]);
```


### `get(class | token, notFoundValue?)`

Resolves a provider token and returns the instance for that token. If no matching factory is found,
a provided `notFoundValue` is returned, an `InjectionError` thrown otherwise.


## Types of injection tokens

Dependencies can be marked by providing a class or an InjectionToken.

```typescript
class Database { }
const environment = new InjectionToken('environment');

const ExampleService {
    constructor(@Inject db: Database, @Inject(environment) env: string) { }
}
```


## Types of providers

```typescript
const providers = [
    // Classes (implicit)
    DataService,

    // Classes (explicit)
    { provide: token, useClass: ExampleService },

    // Classes with explicit dependencies
    { provide: token, useClass: ExampleService, dependencies: [Database, ErrorLogger] },

    // Factories
    { provide: token, useFactory: () => valueToReturn },

    // Factories with explicit dependencies
    { provide: token, useFactory: (requestFactory) => createApi(requestFactory), dependencies: [RequestFactory] },

    // Constant / precalculated values
    { provide: environment, useValue: 'development' }
];

Injector.createAndResolve(providers);
```

## Dynamic injection / optional dependencies

```typescript
@Injectable
class ServiceWithOptionalDependency {
    private dep: OptionalDependency;

    constructor(injector: Injector) {
        try {
            this.dep = injector.get(OptionalDependency);
        } catch (ex) {
            // OptionalDependency was not provided
            this.dep = null;
        }
    }
}
```

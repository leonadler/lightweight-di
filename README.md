# Lightweight Dependency Injection

[![npm version](https://badge.fury.io/js/lightweight-di.svg)](https://badge.fury.io/js/lightweight-di)
[![travis build status](https://travis-ci.org/leonadler/lightweight-di.svg)](https://travis-ci.org/leonadler/lightweight-di/)

A dependency injection library for node and the browser, based on [Angulars DI](https://angular.io/guide/architecture#dependency-injection).
Optimized for use via [TypeScript](https://github.com/Microsoft/TypeScript#readme) or [babel](https://github.com/babel/babel#readme) [decorators](https://babeljs.io/docs/plugins/transform-decorators/).


## Getting started

### 1. Install the library in your project

```sh
npm install --save lightweight-di
```

### 2. Import the required decorators from the package

```typescript
// TypeScript / Babel / Webpack
import { Injectable } from 'lightweight-di';

// Node.js / Browserify
const { Injectable } = require('lightweight-di');
```

### 3. Decorate classes with dependencies

```typescript
@Injectable
class FileLogger {
    constructor(private fs: FileSystem) { }
    log(message: string) {
        fs.appendToFile('app.log', message);
    }
}
```

### 4. Bootstrap your application entry point with `Injector`

```typescript
import { Injector } from 'lightweight-di';
const injector = Injector.resolveAndCreate([App, Dependency1, Dependency2]);
injector.get(App).run();
```

## Documentation & Examples

For the full API check out the [documentation](https://github.com/leonadler/lightweight-di/blob/master/docs/api.md)
or the [examples](https://github.com/leonadler/lightweight-di/blob/master/docs/examples) on GitHub.


## License

[MIT](https://github.com/leonadler/lightweight-di/blob/master/LICENSE)

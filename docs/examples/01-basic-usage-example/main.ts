import { Injector } from 'lightweight-di';
import { App } from './app';
import { Car } from './car';
import { Motor } from './motor';
import { MotorOil, Oil } from './oil';
import { CheapTires, Tires } from './tires';

function main() {
    const providers = [
        App,
        Car,
        { provide: Oil, useClass: MotorOil },
        { provide: Tires, useClass: CheapTires }
        // or
        //{ provide: Tires, useClass: ExpensiveTires }
    ];
    const injector = Injector.resolveAndCreate(providers);
    const app = injector.get(App);
    return app.run();
}

main();

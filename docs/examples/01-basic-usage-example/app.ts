import { Injectable } from 'lightweight-di';
import { Car } from './car';

@Injectable
export class App {
    constructor(private car: Car) { }

    run() {
        console.log(`Starting car app with car:`);
        console.log(`    Name: ${ this.car.name }`);
        console.log(`    Tires: ${ this.car.numberOfTires } x "${ this.car.brandOfTires }"`);
        console.log(`Let's fill some oil into the motor...`);
        this.car.motor.refillOil();
        console.log(`Motor sounds of the car:`);
        this.car.makeMotorSounds();
    }
}

import { Inject } from 'lightweight-di';
import { Motor } from './motor';
import { Tires } from './tires';

export class Car {
    name = 'ExampleCar Model S';

    constructor(
        @Inject public motor: Motor,
        @Inject private tires: Tires) { }

    get brandOfTires() {
        return this.tires.brand;
    }

    makeMotorSounds() {
        this.motor.makeSounds();
    }

    get numberOfTires() {
        return 4;
    }
}

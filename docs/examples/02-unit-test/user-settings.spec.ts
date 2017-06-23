import { Injector } from 'lightweight-di';
import { expect } from 'chai';

import { LocalStorage } from './local-storage';
import { UserSettings } from './user-settings';

describe('UserSettings', () => {
    let userSettings: UserSettings;
    let mockStorage: MockLocalStorage;

    beforeEach(() => {
        const injector = Injector.resolveAndCreate([
            UserSettings,
            { provide: LocalStorage, useClass: MockLocalStorage }
        ]);
        userSettings = injector.get(UserSettings);
        mockStorage = injector.get(LocalStorage);
    });

    it('defaults to english language and dark theme', () => {
        expect(userSettings.interfaceLanguage).to.equal('en');
        expect(userSettings.uiTheme).to.equal('dark');
    });

    it('changing language saves it to localStorage', () => {
        mockStorage.storedValues = {};
        userSettings.interfaceLanguage = 'ru';
        expect(mockStorage.storedValues.language).to.equal('ru');
    });

    it('changing theme saves it to localStorage', () => {
        mockStorage.storedValues = {};
        userSettings.uiTheme = 'light';
        expect(mockStorage.storedValues.theme).to.equal('light');
    });

});

class MockLocalStorage {
    storedValues: { [key: string]: string } = {};
    getItem(key: string) {
        return this.storedValues[key];
    }
    setItem(key: string, data: string) {
        this.storedValues[key] = data;
    }
}

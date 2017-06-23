import { Inject } from 'lightweight-di';
import { LocalStorage } from './local-storage';

export class UserSettings {
    constructor(@Inject private localStorage: LocalStorage) {
        this.language = localStorage.getItem('language') || 'en';
        this.theme = (localStorage.getItem('theme') as 'dark' | 'light') || 'dark';
    }

    private language: string;
    private theme: 'dark' | 'light';

    get interfaceLanguage() {
        return this.language;
    }
    set interfaceLanguage(lang: string) {
        this.language = lang;
        this.localStorage.setItem('language', lang);
    }

    get uiTheme() {
        return this.theme;
    }
    set uiTheme(theme: 'dark' | 'light') {
        this.theme = theme;
        this.localStorage.setItem('theme', theme);
    }
}

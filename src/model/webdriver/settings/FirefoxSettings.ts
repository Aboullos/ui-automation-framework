import { Browser } from 'selenium-webdriver';
import { DriverSettings } from "./DriverSettings";
import * as firefox from "selenium-webdriver/firefox"

export class FirefoxSettings extends DriverSettings {

    constructor() {
        super();
        
        this.createBuilder();
        this.builder.forBrowser(Browser.FIREFOX);
    }

    setHeadless(value: boolean) {
        if(value) {
            this.builder.setFirefoxOptions(new firefox.Options().headless());
        }
    }
}
import * as webdriver from 'selenium-webdriver';
import { DriverSettings } from "./DriverSettings";
import * as firefox from "selenium-webdriver/firefox"

export class FirefoxSettings extends DriverSettings {

    constructor() {
        super();
        this.capabilities = webdriver.Capabilities.firefox();
        this.createBuilder();
    }

    setHeadless(value: boolean) {
        if(value) {
            this.builder.setFirefoxOptions(new firefox.Options().headless());
        }
    }
}
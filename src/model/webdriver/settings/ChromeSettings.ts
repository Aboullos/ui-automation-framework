import { Capabilities } from 'selenium-webdriver';
import { DriverSettings } from "./DriverSettings";
import * as chrome from "selenium-webdriver/chrome"

export class ChromeSettings extends DriverSettings {

    constructor() {
        super();
        this.capabilities = Capabilities.chrome();
        this.createBuilder();
    }

    setHeadless(value: boolean) {
        if(value) {
            this.builder.setChromeOptions(new chrome.Options().headless());
        }
    }

    setMobileEmulation(deviceName: string) {
        return this.builder.setChromeOptions(new chrome.Options().setMobileEmulation({ "deviceName": deviceName }));
    }
}
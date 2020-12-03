import * as webdriver from 'selenium-webdriver';
import { DriverSettings } from "./DriverSettings";
import * as safari from "selenium-webdriver/safari"

export class SafariSettings extends DriverSettings {

    constructor() {
        super();
        this.capabilities = webdriver.Capabilities.safari();
        this.createBuilder();
    }
}
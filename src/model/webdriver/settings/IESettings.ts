import * as webdriver from 'selenium-webdriver';
import { DriverSettings } from "./DriverSettings";
import * as ie from "selenium-webdriver/ie"

export class IESettings extends DriverSettings {

    constructor() {
        super();
        this.capabilities = webdriver.Capabilities.ie();
        this.createBuilder();
    }
}
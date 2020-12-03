import * as webdriver from 'selenium-webdriver';
import { DriverSettings } from "./DriverSettings";
import * as edge from "selenium-webdriver/edge"

export class EdgeSettings extends DriverSettings {

    constructor() {
        super();
        this.capabilities = webdriver.Capabilities.edge();
        this.createBuilder();
    }
}
import { DriverSettings } from "./DriverSettings";
import { Browser } from 'selenium-webdriver';

export class EdgeSettings extends DriverSettings {

    constructor() {
        super();
        
        this.createBuilder();
        this.builder.forBrowser(Browser.EDGE);
    }
}
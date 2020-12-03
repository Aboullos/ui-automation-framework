import { Browser } from 'selenium-webdriver';
import { DriverSettings } from "./DriverSettings";

export class SafariSettings extends DriverSettings {

    constructor() {
        super();
        
        this.createBuilder();
        this.builder.forBrowser(Browser.SAFARI);
    }
}
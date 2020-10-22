import { By }  from 'selenium-webdriver';
import { DriverExt } from "./DriverExt";

export class PageObject {

    driver: DriverExt;

    constructor(driver: DriverExt) {
        this.driver = driver;
    }
}
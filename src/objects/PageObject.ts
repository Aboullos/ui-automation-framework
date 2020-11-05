import { By }  from 'selenium-webdriver';
import { DriverExt } from "./webdriver/DriverExt";
import { TestObject } from "./TestObject";

export class PageObject {

    protected properties: any;
    protected driver: DriverExt;
    protected testObject: TestObject;

    constructor(testObject: TestObject) {
        this.testObject = testObject;
        this.driver = testObject.getDriver();
        this.properties = testObject.getProperties();
    }
}
import { DriverExt } from "./webdriver/DriverExt";
import { properties } from "../Constants";
import * as Constants from "../Constants";
import { Steps } from "../../tests/steps/Steps";
import { TestObject } from "./TestObject";
import { IHash } from "./utils/Utils";

export class SuiteObject {

    steps: Steps;
    testObject: TestObject;
    testData: IHash;
    
    beforeEach() {
        this.testObject = new TestObject();
        this.steps = new Steps(this.testObject);
        
        console.log("process.argv: " + process.argv);
        this.testObject.createDriver(Constants.CHROME);
    }
}
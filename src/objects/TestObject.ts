import { DriverExt } from "./webdriver/DriverExt";
import { properties } from "./../Constants";

export class TestObject {

    private driver: DriverExt;

    getProperties() {
        return properties;
    }

    getDriver() {
        return this.driver;
    }

    createDriver(application: string) {
        this.driver = new DriverExt(application);

        return this.driver;
    }

    setDriver(driver: DriverExt) {
        this.driver = driver;
    }

    setHeadlessDriver(value: boolean) {
        this.driver.setHeadless(value);
    }

    setEmulationDevice(deviceName: string) {
        this.driver.setEmulationDevice(deviceName);
    }

    setHubUrl(url: string) {
        this.driver.setHubUrl(url);
    }

    async handleTestEnd(testCaseName: string, testCaseStatus: string) {        
        if (testCaseStatus === 'failed') {
            // Capturing screenshot if test fails
            await this.driver.takeScreenshot();
        }

        console.log(`Test: ${testCaseName}, Status: ${testCaseStatus}!`);

        await this.driver.quit();
    }
}
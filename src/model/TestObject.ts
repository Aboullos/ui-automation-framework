import * as fs from 'fs';
import { properties } from "../Constants";
import { DriverExt } from "./webdriver/DriverExt";

export class TestObject {

    private testName: string;
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

    setDriverPlatform(platform: string) {
        this.driver.setPlatform(platform);
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
        if (testCaseStatus === 'failed' || testCaseStatus == undefined) {
            testCaseStatus = 'failed'
            // Capturing logs
            let logs = await this.driver.getBrowserLogs();

            if(logs.length > 0) {
                console.log("Printing console log:");
                
                for(let index in logs) {
                    console.log(logs[index].level.name + ': ' + logs[index].message)
                }

                console.log("End of log");
            }

            // Capturing screenshot
            await this.driver.takeScreenshot();

            // Capturing html
            let source = await this.driver.getSource();

            if(source) {
                let htmlReportFolder = './' + properties.reports_folder;
                let htmlFileName = new Date().getTime().toString() + '.html';

                if (!fs.existsSync(htmlReportFolder)){
                    fs.mkdirSync(htmlReportFolder);
                }

                htmlReportFolder += '/' + properties.htmls_folder;
                
                if (!fs.existsSync(htmlReportFolder)){
                    fs.mkdirSync(htmlReportFolder);
                }

                console.log("Saving HTML as: " + htmlReportFolder + '/' + htmlFileName);

                fs.writeFileSync(htmlReportFolder + '/' + htmlFileName, source);
            }
        }

        console.log(`Test: ${testCaseName}, Status: ${testCaseStatus}!`);

        await this.driver.quit();
    }
}
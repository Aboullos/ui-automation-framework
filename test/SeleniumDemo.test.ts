import { should } from 'chai';
import { LoginPage } from "../pages/LoginPage";
import { WelcomePage } from "../pages/WelcomePage";
import { DriverExt } from "../src/objects/DriverExt";
import * as webdriver from 'selenium-webdriver';
should();

describe('Selenium Demo Test Suite', function () {
    let driver: DriverExt;
    // Time out for test execution
    this.timeout(60000);
    
    before(function () {
        // Initializing driver
        driver = new DriverExt("chrome");
    });
    
    afterEach(function () {
        let testCaseName: string = this.currentTest.title;
        let testCaseStatus: string = this.currentTest.state;
        
        if (testCaseStatus === 'failed') {
            console.log(`Test: ${testCaseName}, Status: Failed!`);
            // Capturing screenshot if test fails
            driver.takeScreenshot();
        } else if (testCaseStatus === 'passed') {
            console.log(`Test: ${testCaseName}, Status: Passed!`);
        } else {
            console.log(`Test: ${testCaseName}, Status: Unknown!`);
        }
    });

    after(function () {
        driver.quit();
    });

    it('should login to Keycloak', async function () {
        let url: string = `http://localhost:8081/auth`;

        await driver.go(url);
        console.log(`Page "${url}" opened`);

        await new WelcomePage(driver)
            .goToAdminConsole();

        await new LoginPage(driver)
            .logIn();

        driver.getCurrentUrl().then((currentUrl) => {
            console.log(currentUrl)
            currentUrl.should.equal("http://localhost:8081/auth/admin/master/console/#/realms/master");
        })
    });
});
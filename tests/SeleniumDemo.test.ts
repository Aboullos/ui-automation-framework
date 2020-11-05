import { should } from 'chai';
import { LoginPage } from "./pages/LoginPage";
import { SidebarPage } from "./pages/admin_console/SidebarPage";
import { TestObject } from "../src/objects/TestObject";
import * as Constants from "../src/Constants";
import { HeaderPage } from './pages/admin_console/HeaderPage';
import { Steps } from './steps/Steps';

should();

describe('Selenium Demo Test Suite', function () {
    
    let steps: Steps;
    let testObject: TestObject;
    
    beforeEach(function () {
        testObject = new TestObject();
        steps = new Steps(testObject);
        
        testObject.createDriver(Constants.CHROME);
    });

    it('should login to Keycloak', async function () {
        await steps.logIn();
        await steps.isAdminConsolePage();
    });

    it('should not login to Keycloak', async function () {
        await steps.logIn("error", "error");
        await steps.checkLoginError("Invalid username or password.");
    });

    it('should fail creating Master realm', async function () {
        await steps.logIn();

        await steps.createRealm("Master");
        await steps.checkNotificationMesage("Error: Conflict detected. See logs for details");
    });

    it('should create Test realm', async function () {
        await steps.logIn();

        await steps.createRealm("Test");
        await steps.checkNotificationMesage("Realm created");
    });

    it('should change to Test realm', async function () {
        await steps.logIn();

        await steps.checkCurrentRealm("Master");
        await steps.goToRealm("Test");
        await steps.checkCurrentRealm("Test");
    });
    
    afterEach(async function () {
        testObject.handleTestEnd(this.currentTest.title, this.currentTest.state);
    });
});
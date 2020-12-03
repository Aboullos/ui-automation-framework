import { should } from 'chai';
import { TestObject } from "../src/model/TestObject";
import * as Constants from "../src/Constants";
import { Steps } from './steps/Steps';
import { IHash } from '../src/model/utils/Utils';
import { SSL_OP_EPHEMERAL_RSA } from 'constants';

should();

describe('Selenium Demo Test Suite', function () {
    
    let steps: Steps;
    let testObject: TestObject;
    let testData: IHash;
    
    beforeEach(async function () {
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

        await steps.createRealm("master");
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
        await testObject.handleTestEnd(this.currentTest.title, this.currentTest.state);
    });
});
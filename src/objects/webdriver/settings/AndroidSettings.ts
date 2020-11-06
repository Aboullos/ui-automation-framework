import { DriverSettings } from "./DriverSettings";

export class AndroidSettings extends DriverSettings {

    constructor(browserName: string) {
        super();
        this.capabilities = {
            browserName: browserName,
            platformName: 'android',
            autoGrantPermissions: true,
            ignoreHiddenApiPolicyError: true,
            automationName: "UiAutomator2",
            noReset: true,
            chromeOptions: { w3c: false},
            //app: './app/LGCalculator.apk',
            //appPackage: 'com.android.package',
            //appActivity: 'com.android.pacakge.activity',
            waitforTimeout: 30 * 60000,
            commandTimeout: 30 * 60000,
            newCommandTimeout: 30 * 60000,
           };

        this.createBuilder();
    }
}
import { exception } from 'console';
import * as fs from 'fs';
import { By }  from 'selenium-webdriver';
import * as webdriver from 'selenium-webdriver';
import * as Constants from "../../Constants";
import { DriverSettings } from './settings/DriverSettings';
import { ChromeSettings } from './settings/ChromeSettings';
import { EdgeSettings } from './settings/EdgeSettings';
import { FirefoxSettings } from './settings/FirefoxSettings';
import { IESettings } from './settings/IESettings';
import { SafariSettings } from './settings/SafariSettings';

export class DriverExt {

    private hub_url: string;
    private platform: string;
    private application: string;
    private emulation_device: string;

    private implicitTimeout = 60000;
    private pageLoadTimeout = 60000;
    private scriptTimeout = 20000;

    private headless: boolean = false;
    private checkForAngular: boolean = true;
    private checkForPageToLoad: boolean = true;

    private driver: webdriver.WebDriver;
    private capabilities: webdriver.Capabilities;

    constructor(application: string, platform: string = Constants.DESKTOP) {
        this.application = application;
        this.platform = platform;
    }

    //#region Initializers
    private initializeDriver() {
        let settings = this.createSetting();

        settings.setHeadless(this.headless);

        if(this.emulation_device) {
            settings.setMobileEmulation(this.emulation_device);
        }

        if(this.hub_url) {
            settings.setHubUrl(this.hub_url);
        }

        this.driver = settings.build();

        this.setTimeouts();
        this.maximizeWindow();
    }
    
    createSetting() {
        let driverSettings: DriverSettings;
    
        if(this.application.toLowerCase() == Constants.CHROME) {
            driverSettings = new ChromeSettings();
        } else if(this.application.toLowerCase() == Constants.FIREFOX) {
            driverSettings = new FirefoxSettings();
        } else if(this.application.toLowerCase() == Constants.SAFARI) {
            driverSettings = new SafariSettings();
        } else if(this.application.toLowerCase() == Constants.IE) {
            driverSettings = new IESettings();
        } else if(this.application.toLowerCase() == Constants.EDGE) {
            driverSettings = new EdgeSettings();
        }
    
        return driverSettings;
    }
    //#endregion

    //#region Basic getters
    getDriver() {
        return this.driver;
    }

    async getTitle() {
        return await this.driver.getTitle();
    }

    async getSource() {
        return await this.driver.getPageSource();
    }

    async getWindowSize() {
        return await this.driver.manage().window().getSize();
    }

    async getCurrentUrl () {
        return await this.driver.getCurrentUrl();
    }
    //#endregion

    //#region Basic setters
    setHubUrl(url: string) {
        this.hub_url = url;
    }

    setHeadless(value: boolean) {
        this.headless = value;
    }

    setEmulationDevice(device: string) {
        this.emulation_device = device;
    }

    setWaitForAngular(value: boolean) {
        this.checkForAngular = value;
    }

    setWaitForPageToLoad(value: boolean) {
        this.checkForPageToLoad = value;
    }

    async setImplicitWait(waitTime: number) {
        if(this.driver) {
            this.implicitTimeout = waitTime;
            await this.setTimeouts();
        }
    }

    async setPageLoadWait(waitTime: number) {
        if(this.driver) {
            this.pageLoadTimeout = waitTime;
            await this.setTimeouts();
        }
    }

    async setScriptWait(waitTime: number) {
        if(this.driver) {
            this.scriptTimeout = waitTime;
            await this.setTimeouts();
        }
    }

    async setTimeouts(waitTime?: number) {
        let implicitTimeout = waitTime ? waitTime : this.implicitTimeout;
        let pageLoadTimeout = waitTime ? waitTime : this.pageLoadTimeout;
        let scriptTimeout = waitTime ? waitTime : this.scriptTimeout;

        await this.driver.manage().setTimeouts( { 
            implicit: implicitTimeout, 
            pageLoad: pageLoadTimeout, 
            script: scriptTimeout } )
    }

    async setWindowPosition(x: number, y: number) {
        await this.driver.manage().window().setPosition(x, y);
    }

    async setWindowSize(width: number, height: number) {
        await this.driver.manage().window().setSize(width, height);
    }

    async maximizeWindow() {
        await this.driver.manage().window().maximize();
    }

    async executeJavascript(script: string, ...args: any[]) {
        return await this.driver.executeScript(script, ...args);
    }

    executeAsyncJavascript(script: string, ...args: any[]) {
        this.driver.executeAsyncScript(script, ...args);
    }
    //#endregion

    //#region WebElement getters
    async getElement(element: webdriver.By | webdriver.WebElement) {
        if(element instanceof webdriver.By) {
            element = await this.driver.findElement(element as webdriver.By)
        }

        return element;
    }

    async getElements(by: webdriver.By) {
        return await this.driver.findElements(by);
    }

    async getElementChildByText(element: webdriver.By, text: string) {
        let listElement = await this.driver.findElement(element);

        this.setTimeouts(3000);
        let result = await listElement.findElement(By.xpath("//*[contains(text(), '" + text + "')]"));
        this.setTimeouts();

        return result;
    }

    async getElementChildByAttribute(element: webdriver.By, attribute: string, value: string) {
        let listElement = await this.driver.findElement(element);

        this.setTimeouts(3000);
        let result = await listElement.findElement(By.css("[" + attribute + "='" + value + "')]"));
        this.setTimeouts();

        return result;
    }

    async getElementChildByAttributeContaining(element: webdriver.By, attribute: string, value: string) {
        let listElement = await this.driver.findElement(element)

        return await listElement.findElement(By.css("[" + attribute + "*='" + value + "')]"));
    }

    async getAttribute(element: webdriver.By | webdriver.WebElement, attribute: string) {
        return await (await this.getElement(element)).getAttribute(attribute)
    }

    async getElementLocation(element: webdriver.By | webdriver.WebElement) {
        return await (await this.getElement(element)).getLocation();
    }

    async getElementSize(element: webdriver.By | webdriver.WebElement) {
        return await (await this.getElement(element)).getSize();
    }
    //#endregion

    //#region WebElement setters
    async setAttribute(element: webdriver.By | webdriver.WebElement, attribute: string, value: string) {
        await this.driver.executeScript("arguments[0].setAttribute(arguments[1], arguments[2])", 
            await this.getElement(element), attribute, value);
    }

    async removeAttribute(element: webdriver.By | webdriver.WebElement, attribute: string) {
        await this.driver.executeScript("arguments[0].removeAttribute(arguments[1], arguments[2])",
            await this.getElement(element), attribute);
    }

    async removeElement(element: webdriver.By | webdriver.WebElement) {
        await this.driver.executeScript("arguments[0].remove()", await this.getElement(element));
    }
    //#endregion

    //#region Navigation
    async go(url: string) {
        if(this.driver == undefined) {
            this.initializeDriver();
        }

        await this.driver.get(url);
        await this.waitForLoadToComplete();
    }

    async refresh() {
        await this.driver.navigate().refresh();
    }

    async back() {
        await this.driver.navigate().back();
    }

    async forward() {
        await this.driver.navigate().forward();
    }

    async quit() {
        if(this.driver) {
            await this.driver.quit();
            this.driver = undefined;
        }
    }
    //#endregion

    //#region Click methods
    async click(element: webdriver.By | webdriver.WebElement) {
        element = await this.waitForElementToBeClickable(element);
        
        await element.click();

        await this.waitForLoadToComplete();
    }

    async clickElementChildByText(element: webdriver.By, text: string) {
        (await this.getElementChildByText(element, text)).click();

        await this.waitForLoadToComplete();
    }

    async clickOver(element: webdriver.By | webdriver.WebElement) {
        await this.driver.executeScript(
            "document.elementFromPoint(" 
            + "arguments[0].getBoundingClientRect().x, "
            + "arguments[0].getBoundingClientRect().y).click()",
            await this.getElement(element));

        await this.waitForLoadToComplete();
    }
    //#endregion

    //#region Text methods
    async getText(element: webdriver.By | webdriver.WebElement) {
        return await (await this.getElement(element)).getText();
    }
    
    async writeText(element: webdriver.By | webdriver.WebElement, text: string) {
        await (await this.getElement(element)).sendKeys(text);

        await this.waitForLoadToComplete();
    }
    
    async setText(element: webdriver.By | webdriver.WebElement, text: string) {
        await this.clearText(element);
        await this.writeText(element, text);
    }
    
    async clearText(element: webdriver.By | webdriver.WebElement) {
        await (await this.getElement(element)).clear();
        
        await this.waitForLoadToComplete();
    }
    //#endregion

    //#region Javascript methods
    async dispatchEvent(element: webdriver.By | webdriver.WebElement, event: string) {
        await this.driver.executeScript(
            "arguments[0].dispatchEvent(new Event('" + event + "', {bubbles:true}))", 
            await this.getElement(element))
    }
    //#endregion

    //#region WebElement state
    async isDisplayed(element: webdriver.By | webdriver.WebElement) {
        let displayed = false;

        try {
            await (await this.getElement(element)).isDisplayed();
            displayed = true;
        } catch (error) {}

        return displayed;
    }
    
    async isEnabled(element: webdriver.By | webdriver.WebElement) {
        let enabled = false;

        try {
            await (await this.getElement(element)).isEnabled();
            enabled = true;
        } catch (error) {}

        return enabled;
    }
    
    async isSelected(element: webdriver.By | webdriver.WebElement) {
        let selected = false;

        try {
            await (await this.getElement(element)).isSelected();
            selected = true;
        } catch (error) {}

        return selected;
    }
    //#endregion

    //#region Wait methods
    async waitForLoadToComplete(waitTime: number = this.implicitTimeout) {
        if(this.checkForPageToLoad) {
            await this.waitForPageToLoad(waitTime);
        }
        
        if(this.checkForAngular) {
            await this.waitForAngular(waitTime);
        }

        if(this.checkForPageToLoad) {
            await this.waitForPageToLoad(waitTime);
        }
    }

    async waitForPageToLoad(waitTime: number = this.implicitTimeout) {
        let driver = this.driver

        await driver.wait(new webdriver.Condition("Exception thrown while waiting for page to load", 
            async function() { return await driver.executeScript("return document.readyState").then(
                (result) => { return result == "complete"});}), waitTime);
    }

    async waitForAngular(waitTime: number = this.implicitTimeout) {
        let driver = this.driver

        for(let i = 0; i < 2; i++) {
            await driver.wait(new webdriver.Condition("Exception thrown while waiting for Angular", 
                async function() { return await driver.executeScript("return !window.angular" 
                    + "|| (!!window.angular && !!angular.element(document).injector()"
                    + "&& angular.element(document).injector().get('$http').pendingRequests.length === 0);").then(
                        (result) => { return result == true});}), waitTime);
        }
    }

    async waitForElementToBePresent(element: webdriver.By, waitTime: number = this.implicitTimeout) {

        await this.driver.wait(webdriver.until.elementLocated(element), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBePresent(element: webdriver.By, waitTime: number = this.implicitTimeout) {
        let present = true;

        const {performance} = require('perf_hooks');
        let initialTime = performance.now()

        while(present) {
            try {
                await this.driver.wait(webdriver.until.elementLocated(element), waitTime);

                if(performance.now() - initialTime > waitTime) {
                    break;
                }
            } catch(e) {
                present = false;
            }
        }

        if(present) {
            throw new Error("Element is still present");
        }
    }

    async waitForElementToBeClickable(element: webdriver.By | webdriver.WebElement, waitTime: number = this.implicitTimeout) {
        await this.driver.wait(webdriver.until.elementIsEnabled(await this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBeClickable(element: webdriver.By | webdriver.WebElement, waitTime: number = this.implicitTimeout) {
        await this.driver.wait(webdriver.until.elementIsDisabled(await this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementToBeVisible(element: webdriver.By | webdriver.WebElement, waitTime: number = this.implicitTimeout) {
        await this.driver.wait(webdriver.until.elementIsVisible(await this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBeVisible(element: webdriver.By | webdriver.WebElement, waitTime: number = this.implicitTimeout) {
        await this.driver.wait(webdriver.until.elementIsNotVisible(await this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForAlertToBePresent(element: webdriver.By | webdriver.WebElement, waitTime: number = this.implicitTimeout) {        
        await this.driver.wait(webdriver.until.alertIsPresent(), waitTime);
    }

    async wait(ms: number) {
        return await new Promise(resolve => setTimeout(resolve, ms) );
    }
    //#endregion

    async takeScreenshot(screenshotName: string = new Date().getTime().toString()) {
        let screenshotsFolder = "TestResults/screenshots";

        if (!fs.existsSync(screenshotsFolder)){
            fs.mkdirSync(screenshotsFolder);
        }

        if(this.driver != undefined) {
            await this.driver.takeScreenshot().then((data) => {
                let screenshotPath = `${screenshotsFolder}/${screenshotName}.png`;
    
                console.log(`Saving Screenshot as: ${screenshotPath}`);
                return fs.writeFileSync(screenshotPath, data, 'base64');
            });
        }
    }
}
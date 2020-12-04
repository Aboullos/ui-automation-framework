import * as fs from 'fs';
import { properties } from "../../Constants";
import * as Constants from "../../Constants";
import { DriverSettings } from './settings/DriverSettings';
import { ChromeSettings } from './settings/ChromeSettings';
import { EdgeSettings } from './settings/EdgeSettings';
import { FirefoxSettings } from './settings/FirefoxSettings';
import { IESettings } from './settings/IESettings';
import { SafariSettings } from './settings/SafariSettings';
import { AndroidSettings } from './settings/AndroidSettings';
import { WebDriver, By, WebElement, Condition, until, Browser, IWebDriverOptionsCookie } from 'selenium-webdriver';
import { Command } from 'selenium-webdriver/lib/command';

export class DriverExt {

    private hub_url: string;
    private platform: string;
    private application: string;
    private emulation_device: string;

    private implicitTimeout = 60000;
    private pageLoadTimeout = 60000;
    private scriptTimeout = 20000;

    private headless: boolean;
    private checkForAngular: boolean;
    private checkForPageToLoad: boolean;

    private driver: WebDriver;

    constructor(application: string, platform: string = Constants.DESKTOP) {
        this.application = application;
        this.platform = platform;

        this.headless = properties.headless == undefined ? false : properties.headless;

        this.checkForAngular = properties.wait_for_angular == undefined ? true : properties.wait_for_angular;
        this.checkForPageToLoad = properties.wait_for_page_load == undefined ? true : properties.wait_for_page_load;

        this.implicitTimeout = properties.implicit_timeout == undefined ? 60000 : properties.implicit_timeout;
        this.pageLoadTimeout = properties.page_load_timeout == undefined ? 60000 : properties.page_load_timeout;
        this.scriptTimeout = properties.script_timeout == undefined ? 20000 : properties.script_timeout;
    }

    //#region Initializers
    private async initializeDriver() {
        let settings = this.createSetting();

        settings.setHeadless(this.headless);

        if(this.emulation_device) {
            settings.setMobileEmulation(this.emulation_device);
        }

        if(this.hub_url) {
            settings.setHubUrl(this.hub_url);
        }
        
        this.driver = await settings.build();

        await this.setTimeouts();
        await this.maximizeWindow();
    }
    
    createSetting() {
        let driverSettings: DriverSettings;
    
        if(this.platform == Constants.DESKTOP) {
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
        } else if(this.platform == Constants.ANDROID 
            && [Constants.CHROME, Constants.FIREFOX].indexOf(this.application) > -1) {
            driverSettings = new AndroidSettings(this.application);
        }
    
        return driverSettings;
    }
    //#endregion

    //#region Navigation
    async go(url: string) {
        if(!this.driver) {
            await this.initializeDriver();
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

    //#region Basic getters
    getDriver() {
        return this.driver;
    }

    async getTitle() {
        return await this.driver.getTitle();
    }

    async getSource() {
        let source = '';

        if(this.driver) {
            source = await this.driver.getPageSource();
        }

        return source;
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

    setPlatform(platform: string) {
        this.platform = platform;
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
        if(this.platform == Constants.DESKTOP && !this.emulation_device) {
            await this.driver.manage().window().maximize();
        }
    }

    async executeJavascript(script: string, ...args: any[]) {
        return await this.driver.executeScript(script, ...args);
    }

    executeAsyncJavascript(script: string, ...args: any[]) {
        this.driver.executeAsyncScript(script, ...args);
    }
    //#endregion

    //#region WebElement getters
    async getElement(element: By | WebElement) {
        if(element instanceof By) {
            element = await this.driver.findElement(element as By)
        }

        return element;
    }

    async getElementByText(text: string) {
        let result = undefined;

        this.setTimeouts(3000);
        try {
            result = await this.driver.findElement(By.xpath("//*[contains(text(), '" + text + "')]"));
        } catch(e) {}
        this.setTimeouts();

        return result;
    }

    async getElements(by: By) {
        return await this.driver.findElements(by);
    }

    async getElementChildByText(element: By, text: string) {
        let result = undefined;
        let listElement = await this.driver.findElement(element);

        this.setTimeouts(3000);
        try {
            result = await listElement.findElement(By.xpath("//*[contains(text(), '" + text + "')]"));
        } catch(e) {}
        this.setTimeouts();

        return result;
    }

    async getElementChildByAttribute(element: By, attribute: string, value: string) {
        let result = undefined;
        let listElement = await this.driver.findElement(element);

        this.setTimeouts(3000);
        try {
            result = await listElement.findElement(By.css("[" + attribute + "='" + value + "')]"));
        } catch(e) {}
        this.setTimeouts();

        return result;
    }

    async getElementChildByAttributeContaining(element: By, attribute: string, value: string) {
        let result = undefined;
        let listElement = await this.driver.findElement(element)

        this.setTimeouts(3000);
        try {
            result = await listElement.findElement(By.css("[" + attribute + "*='" + value + "')]"));
        } catch(e) {}
        this.setTimeouts();

        return result;
    }

    async getAttribute(element: By | WebElement, attribute: string) {
        return await (await this.getElement(element)).getAttribute(attribute)
    }

    async getElementLocation(element: By | WebElement) {
        return await (await this.getElement(element)).getLocation();
    }

    async getElementSize(element: By | WebElement) {
        return await (await this.getElement(element)).getSize();
    }
    //#endregion

    //#region WebElement setters
    async setAttribute(element: By | WebElement, attribute: string, value: string) {
        await this.driver.executeScript("arguments[0].setAttribute(arguments[1], arguments[2])", 
            await this.getElement(element), attribute, value);
    }

    async removeAttribute(element: By | WebElement, attribute: string) {
        await this.driver.executeScript("arguments[0].removeAttribute(arguments[1], arguments[2])",
            await this.getElement(element), attribute);
    }

    async removeElement(element: By | WebElement) {
        await this.driver.executeScript("arguments[0].remove()", await this.getElement(element));
    }
    //#endregion

    //#region Click methods
    async click(element: By | WebElement) {
        element = await this.waitForElementToBeClickable(element);
        
        await element.click();

        await this.waitForLoadToComplete();
    }

    async clickElementChildByText(element: By, text: string) {
        (await this.getElementChildByText(element, text)).click();

        await this.waitForLoadToComplete();
    }

    async clickOver(element: By | WebElement) {
        await this.driver.executeScript(
            "document.elementFromPoint(" 
            + "arguments[0].getBoundingClientRect().x, "
            + "arguments[0].getBoundingClientRect().y).click()",
            await this.getElement(element));

        await this.waitForLoadToComplete();
    }
    //#endregion

    //#region Text methods
    async getText(element: By | WebElement) {
        return await (await this.getElement(element)).getText();
    }
    
    async writeText(element: By | WebElement, text: string) {
        await (await this.getElement(element)).sendKeys(text);

        await this.waitForLoadToComplete();
    }
    
    async setText(element: By | WebElement, text: string) {
        await this.clearText(element);
        await this.writeText(element, text);
    }
    
    async clearText(element: By | WebElement) {
        await (await this.getElement(element)).clear();
        
        await this.waitForLoadToComplete();
    }
    //#endregion

    //#region Javascript methods
    async dispatchEvent(element: By | WebElement, event: string) {
        await this.driver.executeScript(
            "arguments[0].dispatchEvent(new Event('" + event + "', {bubbles:true}))", 
            await this.getElement(element))
    }

    async triggerAngularEvent(element: By | WebElement, event: string) {
        await this.driver.executeScript(
            "angular.element(arguments[0]).triggerHandler('" + event + "')", 
            await this.getElement(element))
    }
    //#endregion

    //#region WebElement state
    async isDisplayed(element: By | WebElement) {
        let displayed = false;

        try {
            await (await this.getElement(element)).isDisplayed();
            displayed = true;
        } catch (error) {}

        return displayed;
    }
    
    async isEnabled(element: By | WebElement) {
        let enabled = false;

        try {
            await (await this.getElement(element)).isEnabled();
            enabled = true;
        } catch (error) {}

        return enabled;
    }
    
    async isSelected(element: By | WebElement) {
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

        await driver.wait(new Condition("Exception thrown while waiting for page to load", 
            async function() { return await driver.executeScript("return document.readyState").then(
                (result) => { return result == "complete"});}), waitTime);
    }

    async waitForAngular(waitTime: number = this.implicitTimeout) {
        let driver = this.driver

        for(let i = 0; i < 2; i++) {
            await driver.wait(new Condition("Exception thrown while waiting for Angular", 
                async function() { return await driver.executeScript("return !window.angular" 
                    + "|| (!!window.angular && !!angular.element(document).injector()"
                    + "&& angular.element(document).injector().get('$http').pendingRequests.length === 0);").then(
                        (result) => { return result == true});}), waitTime);
        }
    }

    async waitForElementToBePresent(element: By, waitTime: number = this.implicitTimeout) {

        await this.driver.wait(until.elementLocated(element), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBePresent(element: By, waitTime: number = this.implicitTimeout) {
        let present = true;

        const {performance} = require('perf_hooks');
        let initialTime = performance.now()

        while(present) {
            try {
                await this.driver.wait(until.elementLocated(element), waitTime);

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

    async waitForElementToBeClickable(element: By | WebElement, waitTime: number = this.implicitTimeout) {
        await this.driver.wait(until.elementIsEnabled(await this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBeClickable(element: By | WebElement, waitTime: number = this.implicitTimeout) {
        await this.driver.wait(until.elementIsDisabled(await this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementToBeVisible(element: By | WebElement, waitTime: number = this.implicitTimeout) {
        await this.driver.wait(until.elementIsVisible(await this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBeVisible(element: By | WebElement, waitTime: number = this.implicitTimeout) {
        await this.driver.wait(until.elementIsNotVisible(await this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForAlertToBePresent(element: By | WebElement, waitTime: number = this.implicitTimeout) {        
        await this.driver.wait(until.alertIsPresent(), waitTime);
    }

    async wait(ms: number) {
        return await new Promise(resolve => setTimeout(resolve, ms) );
    }
    //#endregion

    //#region Cookies
    async getCookie(cookie: string) {
        return await this.driver.manage().getCookie(cookie);
    }
    
    async getCookies() {
        return await this.driver.manage().getCookies();
    }
    
    async addCookie(cookie: IWebDriverOptionsCookie) {
        await this.driver.manage().addCookie(cookie);
    }
    
    async addCookies(cookies: IWebDriverOptionsCookie[]) {
        for(let index in cookies) {
            this.addCookie(cookies[index]);
        }
    }

    async deleteCookie(cookie: string) {
        return await this.driver.manage().deleteCookie(cookie);
    }
    
    async deleteAllCookies() {
        return await this.driver.manage().deleteAllCookies();
    }
    //#endregion

    //#region Window
    async closeTab() {
        await this.driver.close();
    }

    async getCurrentWindow() {
        return await this.driver.getWindowHandle();
    }

    async getWindowHandles() {
        return await this.driver.getAllWindowHandles();
    }

    async createNewTab() {
        await this.driver.switchTo().newWindow('tab');
    }

    async createNewWindow() {
        await this.driver.switchTo().newWindow('window');
    }

    async switchToWindow(window: string) {
        await this.driver.switchTo().window(window);
    }

    async switchToNextWindow() {
        let currentWindow = await this.getCurrentWindow();
        let windowHandles = await this.getWindowHandles();
        let nextWindowHandle = currentWindow;

        for(let i = 0; i < windowHandles.length; i++) {
            if(windowHandles[i] == currentWindow) {
                if(i + 1 != windowHandles.length) {
                    nextWindowHandle = windowHandles[i + 1];
                } else {
                    nextWindowHandle = windowHandles[0];
                }

                break;
            }
        }

        await this.switchToWindow(nextWindowHandle);
    }

    async switchToPreviousWindow() {
        let currentWindow = await this.getCurrentWindow();
        let windowHandles = await this.getWindowHandles();
        let previousWindowHandle = currentWindow;

        for(let i = 0; i < windowHandles.length; i++) {
            if(windowHandles[i] == currentWindow) {
                if(i == 0) {
                    previousWindowHandle = windowHandles[windowHandles.length - 1];
                } else {
                    previousWindowHandle = windowHandles[i - 1];
                }

                break;
            }
        }

        await this.switchToWindow(previousWindowHandle);
    }
    //#endregion

    //#region Alert handling
    async acceptAlert() {
        await (await this.driver.switchTo().alert()).accept();
    }
    
    async dismissAlert() {
        await (await this.driver.switchTo().alert()).dismiss();
    }
    
    async getAlertText() {
        let result: string;
        
        try {
            result = await (await this.driver.switchTo().alert()).getText();
        } catch(e) {}

        return result;
    }
    
    async authenticateAs(username: string, password: string) {
        await (await this.driver.switchTo().alert()).authenticateAs(username, password);
    }
    
    async writeInAlert(text: string) {
        await (await this.driver.switchTo().alert()).sendKeys(text);
    }
    //#endregion

    //#region Network
    async networkOnline(state: boolean) {
        let networkCommand = new Command('setNetworkConditions');
        networkCommand.setParameter('network_conditions', {
            "offline": state});

        await this.driver.execute(networkCommand);
    }

    async getNetworkConditions() {
        return await this.driver.execute(new Command('getNetworkConditions'));
    }

    async setNetwork(name: string) {
        let networkCommand = new Command('setNetworkConditions');
        networkCommand.setParameter('network_name', name);

        await this.driver.execute(networkCommand);
    }

    async setNetworkConditions(latency: number, downloadThroughput: number, upload_throughput: number) {
        let networkCommand = new Command('setNetworkConditions');
        networkCommand.setParameter('network_conditions', {
            "offline": false,
            "latency": latency,
            "download_throughput": downloadThroughput * 1024,
            "upload_throughput": upload_throughput * 1024});

        await this.driver.execute(networkCommand);
    }
    //#endregion

    //#region Frames
    async switchToFrame(element: By | WebElement) {
        await this.driver.switchTo().frame(await this.getElement(element));
    }

    async exitFrames() {
        await this.driver.switchTo().defaultContent();
    }

    async switchToParentFrame() {
        await this.driver.switchTo().parentFrame();
    }
    //#endregion

    //#region Debugging
    async getBrowserLogs() {
        let logs = [];

        if(this.driver) {
            if(this.application == Browser.CHROME) {
                logs = await this.driver.manage().logs().get("browser");
            }
        }

        return logs;
    }

    async getDriverLogs() {
        let logs = [];

        if(this.driver) {
            logs = await this.driver.manage().logs().get("driver");
        }

        return logs;
    }

    async takeScreenshot(screenshotName: string = new Date().getTime().toString()) {
        let screenshotsFolder = "./" + properties.reports_folder;

        if (!fs.existsSync(screenshotsFolder)){
            fs.mkdirSync(screenshotsFolder);
        }

        screenshotsFolder += "/" + properties.screenshots_folder;

        if (!fs.existsSync(screenshotsFolder)){
            fs.mkdirSync(screenshotsFolder);
        }

        if(this.driver != undefined) {
            await this.driver.takeScreenshot().then((data) => {
                let screenshotPath = `${screenshotsFolder}/${screenshotName}.png`;
    
                console.log(`Saving screenshot as: ${screenshotPath}`);
                return fs.writeFileSync(screenshotPath, data, 'base64');
            });
        }
    }
    //#endregion
}
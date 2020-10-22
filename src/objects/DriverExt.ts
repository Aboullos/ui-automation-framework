import { exception } from 'console';
import * as fs from 'fs';
import * as webdriver from 'selenium-webdriver';
import { Driver } from 'selenium-webdriver/chrome';

export class DriverExt {

    implicitTimeout = 60000;
    pageLoadTimeout = 60000;
    scriptTimeout = 20000;

    checkForAngular: boolean = true;
    checkForPageToLoad: boolean = true;

    driver: webdriver.WebDriver;
    capabilities: webdriver.Capabilities;

    constructor(browser: string) {
        if(browser.toLowerCase() == "chrome") {
            this.capabilities = webdriver.Capabilities.chrome();
        } else if(browser.toLowerCase() == "firefox") {
            this.capabilities = webdriver.Capabilities.firefox();
        }

        this.driver = new webdriver.Builder()
            .withCapabilities(this.capabilities)
            .build();

        this.setTimeouts();
        this.maximizeWindow();
    }

    //#region Basic getters
    getDriver() {
        return this.driver;
    }

    getTitle() {
        return this.driver.getTitle();
    }

    getSource() {
        return this.driver.getPageSource();
    }

    getWindowSize() {
        return this.driver.manage().window().getSize();
    }

    async getCurrentUrl () {
        return this.driver.getCurrentUrl().then((currentUrl: string) => {
            return currentUrl;
        });
    }
    //#endregion

    //#region Basic setters
    setWaitForAngular(value: boolean) {
        this.checkForAngular = value;
    }

    setWaitForPageToLoad(value: boolean) {
        this.checkForPageToLoad = value;
    }

    setImplicitWait(waitTime: number) {
        if(this.driver) {
            this.implicitTimeout = waitTime;
            this.setTimeouts();
        }
    }

    setPageLoadWait(waitTime: number) {
        if(this.driver) {
            this.pageLoadTimeout = waitTime;
            this.setTimeouts();
        }
    }

    setScriptWait(waitTime: number) {
        if(this.driver) {
            this.scriptTimeout = waitTime;
            this.setTimeouts();
        }
    }

    setTimeouts() {
        this.driver.manage().setTimeouts( { 
            implicit: this.implicitTimeout, 
            pageLoad: this.pageLoadTimeout, 
            script: this.scriptTimeout } )
    }

    setWindowPosition(x: number, y: number) {
        this.driver.manage().window().setPosition(x, y);
    }

    setWindowSize(width: number, height: number) {
        this.driver.manage().window().setSize(width, height);
    }

    maximizeWindow() {
        this.driver.manage().window().maximize();
    }

    executeJavascript(script: string, ...args: any[]) {
        this.driver.executeScript(script, ...args);
    }

    executeAsyncJavascript(script: string, ...args: any[]) {
        this.driver.executeAsyncScript(script, ...args);
    }
    //#endregion

    //#region WebElement getters
    getElement(element: webdriver.By | webdriver.WebElement) {
        if(element instanceof webdriver.By) {
            element = this.driver.findElement(element as webdriver.By)
        }
        
        return element;
    }

    getElements(by: webdriver.By) {
        return this.driver.findElements(by);
    }

    getAttribute(element: webdriver.By | webdriver.WebElement, attribute: string) {
        return this.getElement(element).getAttribute(attribute)
    }

    getElementLocation(element: webdriver.By | webdriver.WebElement) {
        return this.getElement(element).getLocation();
    }

    getElementSize(element: webdriver.By | webdriver.WebElement) {
        return this.getElement(element).getSize();
    }
    //#endregion

    //#region WebElement setters
    setAttribute(element: webdriver.By | webdriver.WebElement, attribute: string, value: string) {
        this.driver.executeScript("arguments[0].setAttribute(arguments[1], arguments[2])", 
            this.getElement(element), attribute, value);
    }

    removeAttribute(element: webdriver.By | webdriver.WebElement, attribute: string) {
        this.driver.executeScript("arguments[0].removeAttribute(arguments[1], arguments[2])", 
            this.getElement(element), attribute);
    }

    removeElement(element: webdriver.By | webdriver.WebElement, attribute: string) {
        this.driver.executeScript("arguments[0].remove()", this.getElement(element));
    }
    //#endregion

    //#region Navigation
    async go(url: string) {
        await this.driver.get(url);
        await this.waitForLoadToComplete();
    }

    refresh() {
        this.driver.navigate().refresh();
    }

    back() {
        this.driver.navigate().back();
    }

    forward() {
        this.driver.navigate().forward();
    }

    quit() {
        this.driver.quit();
    }
    //#endregion

    //#region Click methods
    async click(element: webdriver.By | webdriver.WebElement) {
        element = await this.waitForElementToBeClickable(element);
        
        await element.click();

        await this.waitForLoadToComplete();
    }

    clickOver(element: webdriver.By | webdriver.WebElement) {
        this.driver.executeScript(
            "document.elementFromPoint(" 
            + "arguments[0].getBoundingClientRect().x, "
            + "arguments[0].getBoundingClientRect().y).click()",
            this.getElement(element))

        this.waitForLoadToComplete();
    }
    //#endregion

    //#region Text methods
    getText(element: webdriver.By | webdriver.WebElement) {
        this.getElement(element).getText();
    }
    
    async writeText(element: webdriver.By | webdriver.WebElement, text: string) {
        await this.getElement(element).sendKeys(text);

        await this.waitForLoadToComplete();
    }
    
    setText(element: webdriver.By | webdriver.WebElement, text: string) {
        this.clearText(element);
        this.writeText(element, text);
    }
    
    clearText(element: webdriver.By | webdriver.WebElement) {
        this.getElement(element).clear();
        
        this.waitForLoadToComplete();
    }
    //#endregion

    //#region Javascript methods
    dispatchEvent(element: webdriver.By | webdriver.WebElement, event: string) {
        this.driver.executeScript(
            "arguments[0].dispatchEvent(new Event('" + event + "', {bubbles:true}))", 
            this.getElement(element))
    }
    //#endregion

    //#region WebElement state
    isDisplayed(element: webdriver.By | webdriver.WebElement) {
        return this.getElement(element).isDisplayed();
    }
    
    isEnabled(element: webdriver.By | webdriver.WebElement) {
        return this.getElement(element).isEnabled();
    }
    
    isSelected(element: webdriver.By | webdriver.WebElement) {
        return this.getElement(element).isSelected();
    }
    //#endregion

    //#region Wait methods
    async waitForLoadToComplete(waitTime?: number) {
        if(this.checkForPageToLoad) {
            await this.waitForPageToLoad(waitTime);
        }
        
        if(this.checkForAngular) {
            await this.waitForAngular(waitTime);
        }
    }

    async waitForPageToLoad(waitTime?: number) {
        let driver = this.driver
        waitTime = waitTime ? waitTime : this.implicitTimeout;

        await driver.wait(new webdriver.Condition("Exception thrown while waiting for page to load", 
            async function() { return await driver.executeScript("return document.readyState").then(
                (result) => { return result == "complete"});}), waitTime);
    }

    async waitForAngular(waitTime?: number) {
        let driver = this.driver
        waitTime = waitTime ? waitTime : this.implicitTimeout;

        await driver.wait(new webdriver.Condition("Exception thrown while waiting for Angular", 
            async function() { return await driver.executeScript("return !window.angular" 
                + "|| (!!window.angular && !!angular.element(document).injector()"
                + "&& angular.element(document).injector().get('$http').pendingRequests.length === 0);").then(
                    (result) => { return result == true});}), waitTime);
    }

    async waitForElementToBePresent(element: webdriver.By, waitTime?: number) {
        waitTime = waitTime ? waitTime : this.implicitTimeout;

        await this.driver.wait(webdriver.until.elementLocated(element), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBePresent(element: webdriver.By, waitTime?: number) {
        let present = true;
        waitTime = waitTime ? waitTime : this.implicitTimeout;

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

    async waitForElementToBeClickable(element: webdriver.By | webdriver.WebElement, waitTime?: number) {
        waitTime = waitTime ? waitTime : this.implicitTimeout;

        await this.driver.wait(webdriver.until.elementIsEnabled(this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBeClickable(element: webdriver.By | webdriver.WebElement, waitTime?: number) {
        waitTime = waitTime ? waitTime : this.implicitTimeout;
        
        await this.driver.wait(webdriver.until.elementIsDisabled(this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementToBeVisible(element: webdriver.By | webdriver.WebElement, waitTime?: number) {
        waitTime = waitTime ? waitTime : this.implicitTimeout;
        
        await this.driver.wait(webdriver.until.elementIsVisible(this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForElementNotToBeVisible(element: webdriver.By | webdriver.WebElement, waitTime?: number) {
        waitTime = waitTime ? waitTime : this.implicitTimeout;
        
        await this.driver.wait(webdriver.until.elementIsNotVisible(this.getElement(element)), waitTime);

        return this.getElement(element);
    }

    async waitForAlertToBePresent(element: webdriver.By | webdriver.WebElement, waitTime?: number) {
        waitTime = waitTime ? waitTime : this.implicitTimeout;
        
        await this.driver.wait(webdriver.until.alertIsPresent(), waitTime);
    }

    async wait(ms: number) {
        return await new Promise( resolve => setTimeout(resolve, ms) );
    }
    //#endregion

    takeScreenshot() {
        fs.mkdir("TestResults/Screenshots", null);

        this.driver.takeScreenshot().then((data) => {
            let screenshotPath = `TestResults/Screenshots/${new Date().getTime()}.png`;
            console.log(`Saving Screenshot as: ${screenshotPath}`);
            fs.writeFileSync(screenshotPath, data, 'base64');
        });
    }
}
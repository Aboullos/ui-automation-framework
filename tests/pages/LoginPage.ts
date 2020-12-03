import { By }  from 'selenium-webdriver';
import { PageObject } from "../../src/model/PageObject";

export class LoginPage extends PageObject {

    private userNameInput: By = By.id("username");
    private passwordInput: By = By.id("password");
    private submitBtn: By = By.id("kc-login");

    private errorText: By = By.css(".kc-feedback-text");

    async isLogInPage() {
        return await this.driver.isDisplayed(this.userNameInput);
    }

    async logIn(userName: string = "admin", password: string = "admin") {
        await this.driver.writeText(this.userNameInput, userName);
        await this.driver.writeText(this.passwordInput, password);

        await this.driver.click(this.submitBtn);
    }

    async errorMessageIsDisplayed() {
        return await this.driver.isDisplayed(this.errorText);
    }

    async getErrorMessage() {
        return await this.driver.getText(this.errorText);
    }
}
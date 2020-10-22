import { By }  from 'selenium-webdriver';
import { PageObject } from "../src/objects/PageObject";

export class LoginPage extends PageObject {

    userNameInput: By = By.id("username");
    passwordInput: By = By.id("password");
    submitBtn: By = By.id("kc-login");

    async logIn() {
        await this.driver.writeText(this.userNameInput, "admin");
        await this.driver.writeText(this.passwordInput, "admin");

        await this.driver.click(this.submitBtn)
    }
}
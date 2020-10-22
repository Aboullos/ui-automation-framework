import { By }  from 'selenium-webdriver';
import { PageObject } from "../src/objects/PageObject";

export class WelcomePage extends PageObject {

    adminConsoleBtn: By = By.css("a[href*='/admin/']");
    documentationBtn: By = By.css("a[href*='/documentation.html']");
    keycloakProjectBtn: By = By.css("a[href*='www.keycloak.org']");
    mailingListBtn: By = By.css("a[href*='/#!forum/']");
    reprotIssueBtn: By = By.css("a[href*='/issues']");

    async goToAdminConsole() {
        await this.driver.click(this.adminConsoleBtn)
    }
}
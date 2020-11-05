import { By }  from 'selenium-webdriver';
import { PageObject } from "../../../src/objects/PageObject";

export class HeaderPage extends PageObject {

    private menuBtn: By = By.id("nav-toggle");
    private logoBtn: By = By.css("img[alt='Logo']");
    private helpBtn: By = By.id("help");

    private userDrpDwn: By = By.css("[id*='pf-dropdown-toggle-id']");
    private manageAccountBtn: By = By.css(".pf-c-page__header-tools-item [role*='menu'] li:nth-child(1)");
    private serverInfoBtn: By = By.css(".pf-c-page__header-tools-item [role*='menu'] li:nth-child(2)");
    private signOutBtn: By = By.css(".pf-c-page__header-tools-item [role*='menu'] li:nth-child(4)");

    private notificationList: By = By.css(".pf-c-alert-group.pf-m-toast");

    async goToAdminConsole() {
        let url = this.properties.keycloak_url;
        
        console.log(`Navigating to "${url}"`);
        await this.driver.go(url);
    }

    async goToManageAccount() {
        await this.driver.click(this.userDrpDwn);
        await this.driver.click(this.manageAccountBtn);
    }

    async goToServerInfo() {
        await this.driver.click(this.userDrpDwn);
        await this.driver.click(this.serverInfoBtn);
    }

    async signOut() {
        await this.driver.click(this.userDrpDwn);
        await this.driver.click(this.signOutBtn);
    }

    async logoIsVisible() {
        return await this.driver.isDisplayed(this.logoBtn);
    }

    async checkNotificationPresence(message: string) {
        return !!(await this.driver.getElementChildByText(this.notificationList, message));
    }
}
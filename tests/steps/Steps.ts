import { PageObject } from "../../src/objects/PageObject";
import { TestObject } from "../../src/objects/TestObject";
import { CreateRealmPage } from "../pages/admin_console/CreateRealmPage";
import { HeaderPage } from "../pages/admin_console/HeaderPage";
import { SidebarPage } from "../pages/admin_console/SidebarPage";
import { LoginPage } from "../pages/LoginPage";

export class Steps extends PageObject {

    //#region Login
    async logIn(userName: string = "admin", password: string = "admin") {
        let loginPage = new LoginPage(this.testObject);

        if(!await loginPage.isLogInPage()) {
            await new HeaderPage(this.testObject).goToAdminConsole();
        }

        await loginPage.logIn(userName, password);
    }

    async checkLoginError(message: string) {
        let loginPage = new LoginPage(this.testObject);

        (await loginPage.errorMessageIsDisplayed()).should.equals(true);
        (await loginPage.getErrorMessage()).should.equals("Invalid username or password.");   
    }
    //#endregion

    //#region Realm
    async goToRealm(realmName: string) {
        await new SidebarPage(this.testObject)
            .goToRealm(realmName);
    }

    async createRealm(realmName: string) {
        await new SidebarPage(this.testObject)
            .goToCreateRealm();

        let createRealmPage = new CreateRealmPage(this.testObject);

        await createRealmPage.fillRealmName(realmName);
        await createRealmPage.createRealm();
    }

    async checkCurrentRealm(realmName: string) {
        let currentRealmName = await new SidebarPage(this.testObject).getCurrentRealm();

        currentRealmName.should.equals(realmName);  
    }
    //#endregion

    async checkNotificationMesage(message: string) {
        let present = await new HeaderPage(this.testObject)
            .checkNotificationPresence(message);
        
        present.should.equals(true);
    }

    async isAdminConsolePage() {
        (await new HeaderPage(this.testObject)
            .logoIsVisible()).should.equals(true);
    }
}
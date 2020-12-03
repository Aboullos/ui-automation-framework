import { By }  from 'selenium-webdriver';
import { PageObject } from "../../../src/model/PageObject";

export class SidebarPage extends PageObject {

    private realmsDrpDwn: By = By.id("realm-select-toggle");
    private realmsList: By = By.css("#realm-select ul");
    private createRealmBtn: By = By.css("#realm-select li:last-child a");

    private clientsBtn: By = By.id("nav-item-clients");
    private clientScopesBtn: By = By.id("nav-item-client-scopes");
    private realmRolesBtn: By = By.id("nav-item-roles");
    private usersBtn: By = By.id("nav-item-users");
    private groupsBtn: By = By.id("nav-item-groups");
    private sessionsBtn: By = By.id("nav-item-sessions");
    private eventsBtn: By = By.id("nav-item-events");

    private realmSettingsBtn: By = By.id("nav-item-realm-settings");
    private authenticationBtn: By = By.id("nav-item-authentication");
    private identityProvidersBtn: By = By.id("nav-item-identity-providers");
    private userFederationBtn: By = By.id("nav-item-user-federation");

    async getCurrentRealm() {
        return await this.driver.getText(this.realmsDrpDwn);
    }

    async goToRealm(realmName: string) {
        await this.driver.click(this.realmsDrpDwn);
        await this.driver.clickElementChildByText(this.realmsList, realmName);
    }

    async goToCreateRealm() {
        await this.driver.click(this.realmsDrpDwn);
        await this.driver.click(this.createRealmBtn);
    }

    async goToClients() {
        await this.driver.click(this.clientsBtn);
    }

    async goToClientScopes() {
        await this.driver.click(this.clientScopesBtn);
    }

    async goToRealmRoles() {
        await this.driver.click(this.realmRolesBtn);
    }

    async goToUsers() {
        await this.driver.click(this.usersBtn);
    }

    async goToGroups() {
        await this.driver.click(this.groupsBtn);
    }

    async goToSessions() {
        await this.driver.click(this.sessionsBtn);
    }

    async goToEvents() {
        await this.driver.click(this.eventsBtn);
    }

    async goToRealmSettings() {
        await this.driver.click(this.realmSettingsBtn);
    }

    async goToAuthentication() {
        await this.driver.click(this.authenticationBtn);
    }

    async goToIdentityProviders() {
        await this.driver.click(this.identityProvidersBtn);
    }

    async goToUserFederation() {
        await this.driver.click(this.userFederationBtn);
    }
}
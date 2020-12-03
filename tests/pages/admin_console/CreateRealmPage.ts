import { By }  from 'selenium-webdriver';
import { PageObject } from "../../../src/model/PageObject";

export class CreateRealmPage extends PageObject {

    private browseBtn: By = By.id("kc-realm-filename-browse-button");
    private clearBtn: By = By.css(".pf-c-file-upload__file-select button:last-child");
    private realmFileNameInput: By = By.id("kc-realm-filename");
    private realmNameInput: By = By.id("kc-realm-name");
    private enabledSwitch: By = By.css("[for='kc-realm-enabled-switch'] span.pf-c-switch__toggle");

    private createBtn: By = By.css(".pf-c-form__group:last-child button[type='submit']");
    private cancelBtn: By = By.css(".pf-c-form__group:last-child button[type='button']");

    async fillRealmName(realmName: string) {
        await this.driver.writeText(this.realmNameInput, realmName);
    }

    async createRealm() {
        return await this.driver.click(this.createBtn);
    }
}
import * as webdriver from 'selenium-webdriver';
import * as Constants from "../../../Constants";

export class DriverSettings {
    
    builder: webdriver.Builder;
    capabilities: webdriver.Capabilities;

    protected createBuilder() {
        this.builder = new webdriver.Builder()
            .withCapabilities(this.capabilities);
    }

    getCapabilities() {
        return this.capabilities;
    }

    getBuilder() {
        return this.builder;
    }

    setHeadless(value: boolean) {}

    setMobileEmulation(deviceName: string) {}

    setHubUrl(url: string) {
        this.builder.usingServer(url)
    }

    build() {
        return this.builder.build();
    }

}
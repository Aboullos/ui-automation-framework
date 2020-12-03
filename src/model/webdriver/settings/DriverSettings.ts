import { Builder, Capabilities } from 'selenium-webdriver';

export class DriverSettings {
    
    builder: Builder;
    capabilities: {} | Capabilities;

    protected createBuilder() {
        this.builder = new Builder()
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
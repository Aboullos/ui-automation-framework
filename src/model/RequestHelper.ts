import * as bent from 'bent';

export class RequestHelper {

    private host: string;
    private path: string;
    private body: string;
    private headers: string[][] = [];
    private queryParameters: string[][];
    private response;
    private stringResponse: string;
    private clearAfterRequest = true;

    constructor(host: string, path: string='', queryParameters: string[][]=[]) {
        this.host = host;
        this.path = path;
        this.queryParameters = queryParameters;
    }

    public setHost(host: string) {
        this.host = host;
    }

    public addFormParameter(key: string, value:string) {
        if(this.body) {
            this.body += '&';
        } else {
            this.body = '';
        }

        this.body += key + '=' + value
    }

    public setPath(path: string) {
        this.path = path;
    }

    public setBody(body: string) {
        this.body = body;
    }

    public setClearAfterRequest(value: boolean) {
        this.clearAfterRequest = value;
    }

    public addHeader(key: string, value: string) {
        this.headers[key] = value;
    }

    public addHeaders(headers: string[][]) {
        for(var header in headers) {
            this.addHeader(headers[header][0], headers[header][1]);
        }
    }

    public addQueryParameter(key: string, value: string) {
        this.queryParameters.push([key, value]);
    }

    public getQueryParameters() {
        return this.queryParameters;
    }

    public parseQueryParameters() {
        let parameters = [];

        for(var index in this.queryParameters) {    
            parameters[index] = encodeURIComponent(this.queryParameters[index][0]) + '=' 
                + encodeURIComponent(this.queryParameters[index][1]);
        }

        return parameters.join('&');
    }

    public async get() {
        return this.send('GET');
    }

    public async post() {
        return this.send('POST');
    }

    public async put() {
        return this.send('put');
    }

    public async patch() {
        return this.send('PATCH');
    }

    public async delete() {
        return this.send('DELETE');
    }

    private async send(type: string) {
        let request = bent(type);

        let completeUrl = this.host + '/' + this.path + (this.queryParameters ? '?' + this.parseQueryParameters() : '');

        try {
            this.response = await request(completeUrl, this.body, this.headers);
        } catch(e) {
            this.response = e;
        }

        if(this.clearAfterRequest) {
            this.clear();
        }

        this.stringResponse = await this.response.text();

        return this.stringResponse;
    }

    public getBody() {
        return this.body;
    }

    public getStatusCode() {
        return this.response.statusCode;
    }

    public getResponse() {
        return this.response;
    }

    public getResponseAsString() {
        return this.stringResponse;
    }

    public getResponseHeader(value: string) {
        return this.response.headers[value];
    }

    public getResponseHeaders() {
        return this.response.headers;
    }

    public clear() {
        this.body = undefined;
        this.headers = [];
        this.queryParameters = [];
    }

}
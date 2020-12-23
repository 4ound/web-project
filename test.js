import {Backend} from "./static/js/backend.js";
import chai from "chai";
import sinon from 'sinon';
import fetchMock from 'fetch-mock';
const {createSandbox} = sinon;
const {expect} = chai;

describe('Frontend', () => {
    let sandbox;

    beforeEach(() => {
        sandbox = createSandbox();
    })

    afterEach(() => {
        sandbox.restore();
    })

    describe("Make request", () => {
        const response = {"response": "sample response"};
        const url = "http://example.com";

        afterEach(() => {
            fetchMock.restore();
        })

        it("Correct call with response => 200 OK", async () => {
            fetchMock.mock('*', { status: 200, body: response});

            const r = await Backend.makeRequest(url);
            expect(r).be.deep.equal(response);
        })

        it("Something went wrong => 400 BAD", async () => {
            fetchMock.mock('*', 400);

            const r = await Backend.makeRequest(url);
            expect(r).be.oneOf([null, undefined]);
        })

        it("Interrupted connection (slow internet) => Exception", async () => {
            fetchMock.mock('*', {throws: 'Error'});

            const r = await Backend.makeRequest(url);
            expect(r).be.oneOf([null, undefined]);
        })
    })

    describe("Get by name", () => {
        it("Correct call => 200 OK", async () => {
            const cityName = "Moscow";
            const response = {"response": "sample response"};

            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response)
            const weatherData = await Backend.getByName("Moscow");
            expect(weatherData).be.deep.equal(response);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({q: cityName});
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({q: cityName});
        })

        it("Exception or wrong city name => 400 BAD", async () => {
            const cityName = null;
            const response = null;

            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response)
            const weatherData = await Backend.getByName(cityName);
            expect(weatherData).be.oneOf([null, undefined]);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({q: cityName});
        })
    })

    describe("Get by coordinates", () => {

        it("Correct call => 200 OK", async () => {
            const lat = 0, long = 0;
            const response = {"response": "sample response"};

            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response);
            const weatherData = await Backend.getByCoords(lat, long);
            expect(weatherData).be.deep.equal(response);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({lat: lat, long: long});
        })

        it("Exception or wrong latitude or longitude => 400 BAD", async () => {
            const lat = 10, long = null;
            const response = null;

            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response);
            const weatherData = await Backend.getByCoords(lat, long);
            expect(weatherData).be.oneOf([null, undefined]);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({lat: lat, long: long});
        })
    })

    describe("Get favorites", async () => {
        const options = { credentials: 'include' };

        it("Correct call => 200 OK", async () => {
            const response = ["Moscow", "Saint-Petersburg"];
            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response);
            const favoritesList = await Backend.getFavourites();
            expect(favoritesList).be.deep.equal(response);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({});
            expect(makeRequest.getCall(0).args[2]).be.deep.equal(options);
        })

        it("Exception or empty cookie => 400 BAD", async () => {
            const response = null;
            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response);
            const favoritesList = await Backend.getFavourites();
            expect(favoritesList).oneOf([null, undefined]);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({});
            expect(makeRequest.getCall(0).args[2]).be.deep.equal(options);
        })
    })

    describe("Add city to favorites", async () => {
        let options = {
            method: 'POST',
            credentials: 'include',
        };

        it("Correct call => 200 OK", async () => {
            const response = {"response": "sample response"};
            const cityName = "Izhevsk";

            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response);
            const weatherData = await Backend.addFavourite(cityName);
            expect(weatherData).be.deep.equal(response);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({q: cityName});
            expect(makeRequest.getCall(0).args[2]).be.deep.equal(options);
        })

        it("Exception or already exists => 400 BAD", async () => {
            const response = null;
            const cityName = null;

            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response);
            const weatherData = await Backend.addFavourite(cityName);
            expect(weatherData).be.oneOf([null, undefined]);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal({q: cityName});
            expect(makeRequest.getCall(0).args[2]).be.deep.equal(options);
        })
    })

    describe("Remove city from favorites", async () => {
        const cityName = "Izhevsk";
        const options = {
            method: 'DELETE',
            credentials: 'include'
        };
        const params = {q: cityName};

        it("Correct call => 200 OK", async () => {
            const response = {"response": "sample response"};

            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response);
            const weatherData = await Backend.removeFavourite(cityName);
            expect(weatherData).be.deep.equal(response);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal(params);
            expect(makeRequest.getCall(0).args[2]).be.deep.equal(options);
        })

        it("Exception or already exists => 400 BAD", async () => {
            const response = null;

            const makeRequest = sandbox.stub(Backend, "makeRequest").resolves(response);
            const weatherData = await Backend.removeFavourite(cityName);
            expect(weatherData).be.oneOf([null, undefined]);
            expect(makeRequest.callCount).be.equal(1);
            expect(makeRequest.getCall(0).args[1]).be.deep.equal(params);
            expect(makeRequest.getCall(0).args[2]).be.deep.equal(options);
        })
    })
})
import {OpenWeather} from "./open_weather.js";
import {Database} from "./mongo.js";
import {app} from "./server.js"
import mocha from 'mocha'
import chai from 'chai';
import chaiHttp from 'chai-http';
import sinon from 'sinon';

chai.use(chaiHttp);

const {describe, it} = mocha;
const {request, expect} = chai;
const {createSandbox} = sinon;

let sandbox;
beforeEach(function () {
    sandbox = createSandbox();
});

afterEach(function () {
    sandbox.restore();
});


describe("Open Weather Test", function () {
    describe("Get weather by name", () => {
        const q = "Izhevsk";

        it("Correct call => 200 OK", done => {
            const response = {"response": "sample response"};
            const getByName = sandbox.stub(OpenWeather, 'getByName').resolves(response);

            request(app)
                .get(`/weather/city?q=${q}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal(response);
                    expect(getByName.getCall(0).args[0]).to.equal(q);

                    done();
                });
        });

        it("Missing q (cityName) => 400 BAD", done => {
            const getByName = sandbox.stub(OpenWeather, 'getByName').resolves(null);

            request(app)
                .get(`/weather/city?a=${q}`)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(getByName.getCall(0).args[0]).to.be.oneOf([null, undefined]);

                    done();
                });
        });
    })

    describe("Get weather by coordinates", () => {
        const lat = "0";
        const long = "1";

        it("Correct call => 200 OK", done => {
            const response = {"response": "sample response"};
            const getByCoords = sandbox.stub(OpenWeather, 'getByCoords').resolves(response);

            request(app)
                .get(`/weather/coordinates?lat=${lat}&long=${long}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal(response);
                    expect(getByCoords.getCall(0).args[0]).to.equal(lat);
                    expect(getByCoords.getCall(0).args[1]).to.equal(long);

                    done();
                });
        });

        it("Missing lat (latitude) => 400 BAD", done => {
            const getByCoords = sandbox.stub(OpenWeather, 'getByCoords').resolves(null);

            request(app)
                .get(`/weather/coordinates?long=${long}`)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(getByCoords.getCall(0).args[0]).to.be.oneOf([null, undefined]);

                    done();
                });
        });

        it("Missing long (longitude) => 400 BAD", done => {
            const getByCoords = sandbox.stub(OpenWeather, 'getByCoords').resolves(null);

            request(app)
                .get(`/weather/coordinates?lat=${lat}`)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(getByCoords.getCall(0).args[1]).to.be.oneOf([null, undefined]);
                    expect(getByCoords.getCall(0).args[1]).to.be.oneOf([null, undefined]);

                    done();
                });
        });
    })
});

describe("Favorite test", function () {
    const cookieName = "uuid";
    const cookieValue = "64lengthCookie";
    describe("Get cities from favorites", () => {
        it("With known cookie => 200 OK", done => {
            const cities = ["Izhevsk", "Saint-Petersburg", "Moscow"];
            const getCities = sandbox.stub(Database, 'getCities').resolves(cities);

            request(app)
                .get("/favourites")
                .set('Cookie', `${cookieName}=${cookieValue}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal(cities);
                    expect(getCities.getCall(0).args[0]).to.equal(cookieValue);

                    done();
                });
        });

        it("Without cookie or unknown => 200 OK", done => {
            const getCities = sandbox.stub(Database, 'getCities').resolves([]);

            request(app)
                .get("/favourites")
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).to.deep.equal([]);
                    expect(getCities.getCall(0).args[0]).to.be.oneOf([null, undefined]);

                    done();
                });
        });
    });

    describe("Add city to favorites", () => {
        const cityName = "Mozhga";
        const response = {"name": cityName};

        it("Correct call with known cookie and new city => 200 OK", done => {
            const addCity = sandbox.stub(Database, 'addCity').resolves(true);
            const getByName = sandbox.stub(OpenWeather, 'getByName').resolves(response);

            request(app)
                .post(`/favourites?q=${cityName}`)
                .set('Cookie', `${cookieName}=${cookieValue}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).be.deep.equal(response);
                    expect(getByName.getCall(0).args[0]).be.equal(cityName);
                    expect(addCity.getCall(0).args[0]).be.equal(cookieValue);
                    expect(addCity.getCall(0).args[1]).be.equal(cityName);

                    done();
                });
        });

        it("Correct call with new cookie => 200 OK", done => {
            const addCity = sandbox.stub(Database, 'addCity').resolves(true);
            const getByName = sandbox.stub(OpenWeather, 'getByName').resolves(response);

            request(app)
                .post(`/favourites?q=${cityName}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(res.body).be.deep.equal(response);
                    expect(getByName.getCall(0).args[0]).be.equal(cityName);
                    expect(addCity.getCall(0).args[0]).not.be.empty;
                    expect(addCity.getCall(0).args[1]).be.equal(cityName);

                    done();
                });
        });

        it("Already added city => 400 BAD", done => {
            const addCity = sandbox.stub(Database, 'addCity').resolves(false);
            const getByName = sandbox.stub(OpenWeather, 'getByName').resolves(response);

            request(app)
                .post(`/favourites?q=${cityName}`)
                .set('Cookie', `${cookieName}=${cookieValue}`)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(getByName.getCall(0).args[0]).be.equal(cityName);
                    expect(addCity.getCall(0).args[0]).be.equal(cookieValue);
                    expect(addCity.getCall(0).args[1]).be.equal(cityName);

                    done();
                });
        });

        it("Wrong or missed city => 400 BAD", done => {
            const getByName = sandbox.stub(OpenWeather, 'getByName').resolves(null);

            request(app)
                .post(`/favourites`)
                .set('Cookie', `${cookieName}=${cookieValue}`)
                .end((err, res) => {
                    expect(res).to.have.status(400);
                    expect(getByName.getCall(0).args[0]).be.oneOf([null, undefined]);

                    done();
                });
        });

    });

    describe("Remove city from favorites", () => {
        const cityName = "Mozhga";

        it("Correct call city => 200 OK", done => {
            const removeCity = sandbox.stub(Database, 'removeCity').resolves(true);

            request(app)
                .delete(`/favourites?q=${cityName}`)
                .set('Cookie', `${cookieName}=${cookieValue}`)
                .end((err, res) => {
                    expect(res).to.have.status(200);
                    expect(removeCity.getCall(0).args[0]).be.equal(cookieValue);
                    expect(removeCity.getCall(0).args[1]).be.equal(cityName);

                    done();
                });
        });
    });
});
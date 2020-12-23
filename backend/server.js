import express from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import {OpenWeather} from "./open_weather.js";
import {Database} from "./mongo.js";
const mainRouter = express.Router();
export const app = express();

const COOKIE_NAME = "uuid";
const COOKIE_LENGTH = 64;

app.use(cookieParser())

mainRouter.get("/city", (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    OpenWeather.getByName(req.query.q).then(r => {
        if (!r) {
            res.sendStatus(400);
        } else {
            res.send(r);
        }
    });
})

mainRouter.get("/coordinates", (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    OpenWeather.getByCoords(req.query.lat, req.query.long).then(r => {
        if (!r) {
            res.sendStatus(400);
        } else {
            res.send(r);
        }
    })
})

app.route("/favourites")
    .get((req, res) => {
        // console.info("@get " + getCookies(req));
        res.set('Access-Control-Allow-Credentials', 'true');
        res.set('Access-Control-Allow-Origin', req.headers.origin);
        Database.getCities(getCookies(req)).then(cities => {
            // Promise.all(cities.map(name => OpenWeather.getByName(name))).then(weatherCities => res.send((weatherCities)));
            res.send((cities));
        })
    })
    .post((req, res) => {
        // console.info("@post " + getCookies(req));
        res.set('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Allow-Origin', req.headers.origin);
        res.set('Access-Control-Allow-Credentials', 'true');
        let cookies = getCookies(req);
        if (!cookies) {
            cookies = crypto.randomBytes(COOKIE_LENGTH).toString("hex");
            createCookies(res, cookies);
        }

        OpenWeather.getByName(req.query.q).then(r => {
            if (!r) {
                res.sendStatus(400);
            } else {
                Database.addCity(cookies, r.name).then(isAdded => {
                    if (!isAdded) {
                        res.sendStatus(400);
                    } else {
                        res.send(r);
                    }
                });
            }
        });
    })
    .delete((req, res) => {
        // console.info("@delete " + getCookies(req));
        res.set('Access-Control-Allow-Methods', 'DELETE');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.set('Access-Control-Allow-Origin', req.headers.origin);
        res.set('Access-Control-Allow-Credentials', 'true');
        let cookies = getCookies(req);
        Database.removeCity(cookies, req.query.q).then(() => {
            res.send({response: "ok"});
        });
    })

app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', req.headers.origin);
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Credentials", 'true');
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.send('ok');
});

let getCookies = (req) => {
    return req.cookies[COOKIE_NAME];
}

let createCookies = (res, value) => {
    res.cookie(COOKIE_NAME, value, { sameSite: 'none', secure: true });
}

app.use("/weather", mainRouter);

app.listen(process.env.PORT);
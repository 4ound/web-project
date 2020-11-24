import express from "express";
import cookieParser from "cookie-parser";
import crypto from "crypto";
import {OpenWeather} from "./open_weather.js";
import {getCollection, getCities, addCity, removeCity} from "./mongo.js";
const mainRouter = express.Router(),
    app = express();

const COOKIE_NAME = "uuid";
const COOKIE_LENGTH = 64;

app.use(cookieParser())
// app.use(cors({
//     origin : "http://localhost:8080",
//     credentials: true,
// }))

app.get("/", function (req, res) {
    // res.send(process.env.RESPONSE)
    res.send(new URL("https://api.openweathermap.org/data/2.5/weather"));
})

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
        getCities(getCookies(req)).then(cities => {
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
                addCity(cookies, r.name).then(isAdded => {
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
        removeCity(cookies, req.query.q).then(() => {
            res.sendStatus(202);
        });
    })

app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', req.headers.origin);
    res.set("Access-Control-Allow-Headers", "Content-Type");
    res.set("Access-Control-Allow-Credentials", 'true');
    res.set('Access-Control-Allow-Methods', 'GET, POST, DELETE');
    res.send('ok');
});

app.get("/set_cookie", (req, res) => {
    const id = crypto.randomBytes(COOKIE_LENGTH).toString("hex");
    res.cookie(COOKIE_NAME, id).send("Set cookie");
})

app.get("/remove_cookie", (req, res) => {
    res.clearCookie(COOKIE_NAME).send("removed");
})

app.get("/check_cookie", (req, res) => {
    res.send(req.cookies[COOKIE_NAME]);
})

app.get("/check", (req, res) => {
    const collection = getCollection().then(collection => {
        collection.insertOne({name: "Red", town: "kanto"}).then(() => {
            res.send("Inserted");
        })
    });
})

let getCookies = (req) => {
    return req.cookies[COOKIE_NAME];
}

let createCookies = (res, value) => {
    res.cookie(COOKIE_NAME, value);
}

app.use("/weather", mainRouter);

app.listen(process.env.PORT);
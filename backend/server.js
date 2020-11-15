import express from "express";
import {OpenWeather} from "./open_weather.js";
import {getCollection} from "./mongo.js"
import mongodb from 'mongodb';
const mainRouter = express.Router(),
    app = express();

app.get("/", function (req, res) {
    // res.send(process.env.RESPONSE)
    res.send(new URL("https://api.openweathermap.org/data/2.5/weather"));
})

mainRouter.get("/city", (req, res) => {
    OpenWeather.getByName(req.query.q).then(r => {
        if (!r) {
            res.sendStatus(400);
        } else {
            res.send(r);
        }
    });
})

mainRouter.get("/coordinates", (req, res) => {
    OpenWeather.getByCoords(req.query.lat, req.query['long']).then(r => {
        if (!r) {
            res.sendStatus(400);
        } else {
            res.send(r);
        }
    })
})

app.route("/favourites")
    .get((req, res) => {
        res.sendStatus(200);
    })
    .post((req, res) => {
        res.sendStatus(201);
    })
    .delete((req, res) => {
        res.sendStatus(202);
    })

app.get("/check", (req, res) => {
    const collection = getCollection().then(collection => {
        collection.insertOne({name: "Red", town: "kanto"}).then(() => {
            res.send("Inserted");
        })
    });
})

app.use("/weather", mainRouter);

app.listen(process.env.PORT)
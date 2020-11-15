import express from "express";
import { OpenWeather } from "./open_weather.js";
// const openWeather = require("./open_weather")
const app = express();

app.get("/", function (req, res) {
    // res.send(process.env.RESPONSE)
    res.send(new URL("https://api.openweathermap.org/data/2.5/weather"));
})

app.get("/r", (req, res) => {
    OpenWeather.getByName("Ижевск").then(r => {
        res.send(r);
    });
})

app.listen(process.env.PORT)
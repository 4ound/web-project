import { URL } from "url";
import fetch from "node-fetch";

export class OpenWeather {
    static url = new URL("https://api.openweathermap.org/data/2.5/weather");
    static apiKey = process.env.OPEN_WEATHER_API_KEY;

    static getByName(name) {
        let params = {q: name, appid: this.apiKey, units: 'metric', lang: 'ru'};
        return this.makeRequest(this.url, params);
    }

    static getByCoords(latitude, longitude) {
        let params = {lat: latitude, lon: longitude, appid: this.apiKey, units: 'metric', lang: 'ru'};
        return this.makeRequest(this.url, params);
    }

    static async makeRequest(url, params) {
        url.search = new URLSearchParams(params).toString();
        try {
            const response = await fetch(url);
            if (response.ok) {
                return await response.json();
            } else {
                return null;
            }
        } catch (error) {
            console.debug(error);
            return null;
        }
    }
}
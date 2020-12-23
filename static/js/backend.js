export class Backend {
    static url = "https://web-weather-backend.herokuapp.com";

    static getByName(name) {
        let params = {q: name};
        return this.makeRequest(`${this.url}/weather/city`, params);
    }

    static getByCoords(latitude, longitude) {
        let params = {lat: latitude, long: longitude};
        return this.makeRequest(`${this.url}/weather/coordinates`, params);
    }

    static getFavourites() {
        let options = {
            credentials: 'include',
        }
        return this.makeRequest(`${this.url}/favourites`, {}, options);
    }

    static addFavourite(name) {
        let params = {q: name};
        let options = {
            method: 'POST',
            credentials: 'include',
            // body: JSON.stringify({id: 123})
        };
        return this.makeRequest(`${this.url}/favourites`, params, options);
    }

    static removeFavourite(name) {
        let params = {q: name};
        let options = {
            method: 'DELETE',
            credentials: 'include'
        }
        return this.makeRequest(`${this.url}/favourites`, params, options);
    }

    static async makeRequest(url, params = {}, options = {}) {
        url = new URL(url);
        url.search = new URLSearchParams(params).toString();
        // console.info(options);
        try {
            const response = await fetch(url, options);
            if (response.ok) {
                return await response.json();
            } else {
                return null;
            }
        } catch (error) {
            return null;
        }
    }
}
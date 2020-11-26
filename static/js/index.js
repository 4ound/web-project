window.onload = function () {
    updateGeo()

    Backend.getFavourites().then(cityNames => {
        for (const cityName of cityNames) {
            const sectionId = insertDummy();

            Backend.getByName(cityName).then(weatherData => {
                if (weatherData) {
                    addCity(weatherData, sectionId);
                } else {
                    removeDummy(sectionId);
                }
            });
        }
    })


    document.getElementById("toolbar__form").addEventListener("submit", (e) => {
        e.preventDefault();
        let formCity = e.target.elements['form-city'];
        if (!formCity.value) {
            return;
        }
        const sectionId = insertDummy();

        Backend.addFavourite(formCity.value).then(weatherData => {
            if (weatherData) {
                formCity.value = "";
                addCity(weatherData, sectionId);
            } else {
                removeDummy(sectionId);
                alert(`Не удалось добавить информацию о погоде для ${formCity.value}`);
            }
        });
    });

    document.querySelector(".geo-update__input_desktop").addEventListener("click", () => {
        updateGeo();
    });

    document.querySelector(".geo-update__input_mobile").addEventListener("click", () => {
        updateGeo();
    });
};

let updateGeo = function () {
    let currentCity = document.querySelector(".current-city");

    currentCity.querySelector("#current-city-name-weather-icon").setAttribute("src", "static/img/1x1.png");

    let loaders = currentCity.querySelectorAll(".loaded");
    for (const loader of loaders) {
        loader.classList.remove("loaded");
        loader.classList.add("loading");
    }

    getUserLocation(
        function (position) {
            Backend.getByCoords(position.coords.latitude, position.coords.longitude)
                .then(weatherData => updateHeader(weatherData));
        },
        function (err) {
            Backend.getByName("Москва").then(weatherData => updateHeader(weatherData));
            console.debug(err)
        }
    );
}

let updateHeader = function (weatherData) {
    console.info(weatherData);

    let currentCity = document.querySelector(".current-city");

    currentCity.querySelector("#current-city-name").textContent
        = weatherData['name'];
    currentCity.querySelector("#current-city-temperature-value").textContent
        = `${Math.round(weatherData['main']['temp'])}°C`;
    currentCity.querySelector("#current-city-name-weather-icon")
        .setAttribute("src", `https://openweathermap.org/img/wn/${weatherData['weather'][0]['icon']}@4x.png`)

    currentCity.querySelector("#current-city-wind-value").textContent
        = `${weatherData['wind']['speed']} м/с`;
    currentCity.querySelector("#current-city-cloudiness-value").textContent
        = weatherData['weather'][0]['main'];
    currentCity.querySelector("#current-city-pressure-value").textContent
        = `${Math.round(weatherData['main']['pressure'] * 0.750064)} мм. рт. ст.`;
    currentCity.querySelector("#current-city-humidity-value").textContent
        = `${weatherData['main']['humidity']} %`;
    currentCity.querySelector("#current-city-coords-value").textContent
        = `[ ${weatherData['coord']['lon']}, ${weatherData['coord']['lat']} ]`;

    let loaders = currentCity.querySelectorAll(".loading");
    for (const loader of loaders) {
        loader.classList.remove("loading");
        loader.classList.add("loaded");
    }
}

let insertDummy = function () {
    let citiesList = document.getElementsByClassName("cities-list")[0];
    const templateContent = document.getElementById("city-template").content.cloneNode(true);
    const sectionId = '' + Math.random();
    templateContent.children[0].setAttribute('section-id', sectionId);
    citiesList.append(templateContent);
    return sectionId;
}

let removeDummy = function (sectionId) {
    let citiesList = document.getElementsByClassName("cities-list")[0];
    let removingCity = document.querySelector(`.cities-list__city[section-id="${sectionId}"]`);
    citiesList.removeChild(removingCity);
}

let addCity = function (weatherData, sectionId) {
    console.info(weatherData);
    const cityElement = document.querySelector(`.cities-list__city[section-id="${sectionId}"]`);

    console.info(cityElement);
    console.info(sectionId);

    cityElement.setAttribute('city-id', weatherData['id']);
    cityElement.removeAttribute('section-id')

    cityElement.querySelector("#city-name").textContent
        = weatherData['name'];
    cityElement.querySelector("#temperature-value").textContent
        = `${Math.round(weatherData['main']['temp'])}°C`;
    cityElement.querySelector("#weather-icon")
        .setAttribute("src", `https://openweathermap.org/img/wn/${weatherData['weather'][0]['icon']}@4x.png`)

    cityElement.querySelector("#wind-value").textContent
        = `${weatherData['wind']['speed']} м/с`;
    cityElement.querySelector("#cloudiness-value").textContent
        = weatherData['weather'][0]['main'];
    cityElement.querySelector("#pressure-value").textContent
        = `${Math.round(weatherData['main']['pressure'] * 0.750064)} мм. рт. ст.`;
    cityElement.querySelector("#humidity-value").textContent
        = `${weatherData['main']['humidity']} %`;
    cityElement.querySelector("#coords-value").textContent
        = `[ ${weatherData['coord']['lon']}, ${weatherData['coord']['lat']} ]`;

    cityElement.querySelector("button").addEventListener("click", () => {
        Backend.removeFavourite(weatherData['name']).then(response => {
            if (response) {
                let citiesList = document.getElementsByClassName("cities-list")[0];
                let removingCity = document.querySelector(`.cities-list__city[city-id="${weatherData['id']}"]`);
                console.info(citiesList);
                console.info(removingCity);
                citiesList.removeChild(removingCity);
            }
        })
    });

    let loaders = cityElement.querySelectorAll(".loading");
    for (const loader of loaders) {
        loader.classList.remove("loading");
    }
}

let getUserLocation = function (onSuccess, onError) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
};

class Backend {
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
        console.info(options);
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
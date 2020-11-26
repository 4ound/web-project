window.onload = function () {
    updateGeo()

    for (const cityName of getCities()) {
        const sectionId = insertDummy();
        ow.getByName(cityName).then(weatherData => {
            if (weatherData) {
                addCity(weatherData, sectionId);
            } else {
                removeDummy(sectionId);
            }
        });
    }

    document.getElementById("toolbar__form").addEventListener("submit", (e) => {
        e.preventDefault();
        const sectionId = insertDummy();
        let formCity = e.target.elements['form-city'];
        if (getCities().includes(formCity.value)) {
            alert(`Город ${formCity.value} уже добавлен!`);
            formCity.value = "";
            removeDummy(sectionId);
            return;
        }
        ow.getByName(formCity.value).then(
            weatherData => {
            if (weatherData) {
                formCity.value = "";
                if (getCities().includes(weatherData['name'])) {
                    alert(`Город ${weatherData['name']} уже добавлен!`);
                    removeDummy(sectionId);
                    return;
                }
                saveNewCity(weatherData['name']);
                addCity(weatherData, sectionId);
            } else {
                removeDummy(sectionId);
                alert(`Не удалось загрузить информацию о погоде для ${formCity.value}`);
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
            ow.getByCoords(position.coords.latitude, position.coords.longitude)
                .then(weatherData => updateHeader(weatherData));
        },
        function (err) {
            ow.getByName("Москва").then(weatherData => updateHeader(weatherData));
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

let getCities = function () {
    const cities = localStorage.getItem("cities");
    if (!cities) {
        return [];
    }
    return JSON.parse(cities);
}

let saveNewCity = function (city) {
    let cities = getCities();
    cities.push(city);
    localStorage.setItem("cities", JSON.stringify(cities));
}

let removeCity = function (city) {
    const cities = getCities().filter(e => e !== city);
    localStorage.setItem("cities", JSON.stringify(cities));
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
        let citiesList = document.getElementsByClassName("cities-list")[0];
        let removingCity = document.querySelector(`.cities-list__city[city-id="${weatherData['id']}"]`);
        console.info(citiesList);
        console.info(removingCity);
        citiesList.removeChild(removingCity);
        removeCity(weatherData['name']);
    });

    let loaders = cityElement.querySelectorAll(".loading");
    for (const loader of loaders) {
        loader.classList.remove("loading");
    }
}

let getUserLocation = function (onSuccess, onError) {
    navigator.geolocation.getCurrentPosition(onSuccess, onError);
};

class OpenWeather {
    url = new URL("https://api.openweathermap.org/data/2.5/weather");
    apiKey = "89ea62b0afb88ff59dabb47c248e6063";

    getByName(name) {
        let params = {q: name, appid: this.apiKey, units: 'metric', lang: 'ru'};
        return this.makeRequest(this.url, params);
    }

    getByCoords(latitude, longitude) {
        let params = {lat: latitude, lon: longitude, appid: this.apiKey, units: 'metric', lang: 'ru'};
        return this.makeRequest(this.url, params);
    }

    async makeRequest(url, params) {
        url.search = new URLSearchParams(params).toString();
        console.debug(url);
        try {
            const response = await fetch(url);
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

let ow = new OpenWeather();
const getDataButton = document.querySelector("#get-data");
const cityInput = document.querySelector("#city-input");
const countryInput = document.querySelector("#country-code");

const coordinates = { lon: "", lat: "" };
let iconID = "";

const weatherData = {
  weatherMain: "",
  weatherDescription: "",
  weatherIcon: "",
  temp: 0,
  tempMin: 0,
  tempMax: 0,
  pressure: 0,
  humidity: 0,
  windSpeed: 0,
  clouds: "",
  city: "",
  country: "",
};

async function getWeatherData() {
  const city = cityInput.value;
  const countryCode = countryInput.value;
  let url = "";
  if (countryCode === "") {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`;
  } else {
    url = `https://api.openweathermap.org/data/2.5/weather?q=${city},${countryCode}&appid=${API_KEY}`;
  }
  const res = await fetch(url);
  const data = await res.json();

  // The API includes error messages
  // 400 Bad Requests --> Message: Nothing to geocode
  // 404 Not Found --> Message: City not found
  if (data.cod > 399) {
    alert(data.message);
  } else {
    coordinates.lon = data.coord.lon;
    coordinates.lat = data.coord.lat;
    weatherData.weatherMain = data.weather[0].main;
    weatherData.weatherDescription = data.weather[0].description;
    iconID = data.weather[0].icon;
    weatherData.weatherIcon = `http://openweathermap.org/img/wn/${iconID}@2x.png`;
    weatherData.temp = Math.floor(data.main.temp - 273.15);
    weatherData.tempMin = Math.floor(data.main.temp_min - 273.15);
    weatherData.tempMax = Math.floor(data.main.temp_max - 273.15);
    weatherData.pressure = data.main.pressure;
    weatherData.humidity = data.main.humidity;
    weatherData.windSpeed = data.wind.speed;
    weatherData.clouds = data.clouds.all;
    weatherData.city = data.name;
    weatherData.country = data.sys.country;

    const mapContainer = document.querySelector("#map");
    mapContainer.style.display = "block";

    injectData();
    showMap();

    cityInput.value = "";
    countryInput.value = "";
  }
}

function injectData() {
  document.querySelector("#logo").setAttribute("src", weatherData.weatherIcon);
  document.querySelector("#temp-span").innerText = weatherData.temp;
  document.querySelector("#humidity-span").innerText = weatherData.humidity;
  document.querySelector("#wind-span").innerText = weatherData.windSpeed;
  document.querySelector("#city-span").innerText = weatherData.city;
  document.querySelector("#country-span").innerText = weatherData.country;
  document.querySelector("#date").innerText = calculateDate();
  document.querySelector("#weather-main").innerText = weatherData.weatherMain;
  document.querySelector("#cloudiness-span").innerText = weatherData.clouds;
  document.querySelector("#min-temp-span").innerText = weatherData.tempMin;
  document.querySelector("#max-temp-span").innerText = weatherData.tempMax;
  document.querySelector("#atm-pressure-span").innerText = weatherData.pressure;
  document.querySelector("#weather-description-span").innerText =
    weatherData.weatherDescription;
  document.querySelector("#coord-span").innerText =
    coordinates.lon + "  " + coordinates.lat;
}

function calculateDate() {
  const today = new Date();
  const dd = String(today.getDate());
  const mm = String(today.getMonth() + 1);
  const yyyy = today.getFullYear();
  return dd + "/" + mm + "/" + yyyy;
}

function showMap() {
  // solve the issue with map container is already initialized
  const container = L.DomUtil.get("map");

  if (container != null) {
    container._leaflet_id = null;
  }

  // set the view option of the map, lat and lon are from the weather api
  let mapOptions = {
    center: [coordinates.lat, coordinates.lon],
    zoom: 10,
  };

  let map = new L.map("map", mapOptions);
  let layer = new L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  );
  map.addLayer(layer);
  let marker = new L.marker(mapOptions.center);
  marker.addTo(map);
}

getDataButton.addEventListener("click", getWeatherData);

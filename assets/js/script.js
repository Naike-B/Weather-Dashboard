// API Key OpenWeather API
let APIKey = "3036dd353dd59726e1a82ae12ee6a2b9";
// Variable to store the current date
const currentDate = dayjs().format('DD/MM/YYYY');
// Variables
let latitude;
let longitude;
let searchedCities = [];

// Gets the coordinates of the city searched 
function getCityCoordinates(cityName) {
    // API call to get the city coordinates - latitude + longitude
    let queryURLGeocode = "https://api.openweathermap.org/geo/1.0/direct?q=" + cityName + "&limit=1&appid=" + APIKey;
    fetch(queryURLGeocode)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            latitude = data[0].lat;
            longitude = data[0].lon;

            // Adds the cities searched to an array
            searchedCities.push(cityName);
            // Saves the cities added to the array to the local storage transforming the array in a string
            localStorage.setItem("searchedCities", JSON.stringify(searchedCities));
            // Call functions to get current weather and weather forecast
            getCurrentWeather();
            getWeatherForecast();

        });
}
// Gets the current weather
function getCurrentWeather() {
    // API call to get the current weather
    let queryURLCurrentWeather = "https://api.openweathermap.org/data/2.5/weather?lat=" + latitude + "&lon=" + longitude + "&appid=" + APIKey;
    // Clear the current weather data displayed
    $(".city").html("");
    $(".icon").html("");
    $(".wind").html("");
    $(".humidity").html("");
    $(".temp").html("");
    $(".tempC").html("");
    $(".currentDay").html("");
    // Fetches the current weather data from the API
    fetch(queryURLCurrentWeather)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Transfer content of JSON object to HTML elements so that the information is displayed on the page
            $(".city").html("<h1>" + data.name);
            let iconCode = data.weather[0].icon;
            let imgURL = "https://openweathermap.org/img/w/" + iconCode + ".png";
            $(".icon").attr("src", imgURL);
            $(".wind").text("Wind Speed: " + data.wind.speed + " KPH");
            $(".humidity").text("Humidity: " + data.main.humidity + " %");
            // Convert the temperature to Celsius
            var tempC = data.main.temp - 273.15;
            // Adds temperature content to html
            $(".tempC").text("Temperature: " + tempC.toFixed(2) + " °C");
            // Calls HTML element with the id 'currentDay' and adds text including the currentDate to the page
            $(".currentDay").html("<h2>" + currentDate);
        });
};
// Gets the weather forecast for the next 5 days creating and displaying cards including the weather data for each day
function getWeatherForecast() {
    // API call to get the weather forecast
    let queryURLForecast = "https://api.openweathermap.org/data/2.5/forecast?lat=" + latitude + "&lon=" + longitude + "&appid=" + APIKey;
    // Clears the weather forecast
    $("#forecast-container").html("");
    // Fetches the weather forecast from the API
    fetch(queryURLForecast)
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            // Loop through the next 5 days (Thanks Dru!)
            for (let i = 0; i <= 4; i++) {
                // Gets the forecast for the current day
                let forecastData = data.list[i * 8];
                // Creates a new div with class 'forecast-card'
                let forecastCard = $("<div>").addClass("forecast-card");
                // Creates an unordered list
                let forecastList = $("<ul>");
                // Creates li element for the date and converts this date to a string in the format 'DD/MM/YYYY'
                let itemDate = $("<li>").html("<h2 class='card-date'>" + new Date(forecastData.dt_txt).toLocaleDateString('en-GB'));
                // Gets the icon code from the forecast data
                let iconCode = forecastData.weather[0].icon;
                // Creates the URL for the weather icon image
                let imgURL = "https://openweathermap.org/img/w/" + iconCode + ".png";
                // Creates li item for the weather icon
                let itemIcon = $("<li>").html("<img src='" + imgURL + "' />");
                // Gets temperature in Kelvin and converts it to Celsius and rounds the number to two decimals
                let tempC = (forecastData.main.temp - 273.15).toFixed(2);
                // Creates li item for the temperature
                let itemTemp = $("<li>").html("<p>" + "Temp: " + tempC + " °C");
                // Creates li item for teh wind speed
                let itemWind = $("<li>").html("<p>" + "Wind speed: " + forecastData.wind.speed + " KPH");
                // Creates li item for the humidity
                let itemHum = $("<li>").html("<p>" + "Humidty: " + forecastData.main.humidity + " %");
                // Appends li items to the ul list
                forecastList.append(itemDate, itemIcon, itemTemp, itemWind, itemHum);
                // Appends the ul list to the forecast card div
                forecastCard.append(forecastList);
                // Appends the forecast card dive to the forecast container div
                $("#forecast-container").append(forecastCard);
            }
        })
}
// Function to retrieve cities from the local storage and create buttons for them 
function loadSavedCities() {
    // Loads the array of cities from the local storage
    let storedCities = localStorage.getItem("searchedCities");
    // Checks if the array is not null
    if (storedCities) {
        // Parse the string to convert it back to an array
        searchedCities = JSON.parse(storedCities);
        // Gets the history div
        let historyDiv = $("#history");
        // Creates a button for each saved city
        for (let i = 0; i < searchedCities.length; i++) {
            let cityButton = $("<button>").text(searchedCities[i]);
            cityButton.click(function () {
                getCityCoordinates(searchedCities[i]);
            });
            // Appends the button to the history div
            historyDiv.append(cityButton);
        }
    }
}
// Run function loadSavedCities when page loads so that cities searched are displayed
$(window).on("load", loadSavedCities);

// Event handler for the submit button
$("#search-button").click(function (event) {
    // Prevents default behaviour
    event.preventDefault();
    // Variable to store the user search input 
    let cityName = $("#search-input").val().trim();

    getCityCoordinates(cityName);
});
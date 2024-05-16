const userTab = document.querySelector(".your-weather");
const searchTab = document.querySelector(".search-weather");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const grantAccessBtn = document.querySelector("[data-grantAccess]");
const searchInput = document.querySelector("[data-searchInput]");
    
const notFound = document.querySelector("[data-errorImg]");

let oldTab = userTab;
const API_KEY = "5558b3f3b6d1ed40037fb9b93aaaeb65";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab){
    if(newTab != oldTab){
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            userInfoContainer.classList.remove("active");
            grantAccessContainer.classList.remove("active");
            searchForm.classList.add("active");
        }else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            // For coordinates, if we haved saved them there
            getfromSessionStorage();
        }
    }

};

userTab.addEventListener("click", () => {
    // Pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click", () => {
    // Pass clicked tab as input parameter
    switchTab(searchTab);
});

function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
};

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    // Make grantcontainer invisible
    grantAccessContainer.classList.remove("active");
    // make loader visible
    loadingScreen.classList.add("active");

// API CALL
try{
    const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
    );

    const data = await response.json();

    loadingScreen.classList.remove("active");
    userInfoContainer.classList.add("active");
    renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
        console.error("Your location isn't foundend");
    }

};

function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryFlag]");
    const weatherType = document.querySelector("[data-weatherType]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const weatherTemp = document.querySelector("[data-weatherTemp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    // fetch values from weatherInfo object and put it UI elements

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherType.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    weatherTemp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all} %`;
}

// geolocation access
function getLocation() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }else{
        alert("Geolocation support is not available");
    }
}

function showPosition(position) {
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
}
// to get location enable grant access button

grantAccessBtn.addEventListener("click",getLocation);

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return;
    }else{
        console.log(cityName);
        fetchSearchWeatherInfo(cityName);
    }
});

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            if (response.status === 404) {
                // City not found error
                throw new Error(`Weather data for "${city}" not found`);
            } else {
                // Other API error
                throw new Error(`Error: ${response.status} ${response.statusText}`);
            }
        }

        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }catch(err){
        loadingScreen.classList.remove("active");
        console.error(err.message);
        notFound.style.backgroundImage = "url('./assets/not-found.png')";   
    }
};
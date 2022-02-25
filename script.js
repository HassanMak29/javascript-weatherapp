const date = document.querySelector(".header__info--date");
const time = document.querySelector(".header__info--time");

const inputValue = document.querySelector(".form__input");
const submitBtn = document.querySelector(".form__btn");
const loc = document.querySelector(".weatherForcast__location");

const select = document.querySelector(".weatherForcast__select");

const weatherForcast = document.querySelector(".weatherForcast");

const weatherForcastToday = document.querySelector(".weatherForcast__today");

const weekDays = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

setInterval(() => {
  const todayDate = new Date();
  const todaysDate = todayDate.getDate();
  const day = todayDate.getDay();
  const weekDay = weekDays[day];
  const month = months[todayDate.getMonth()];
  const year = todayDate.getFullYear();

  const hours = todayDate.getHours();
  const mins = todayDate.getMinutes().toString().padStart(2, 0);
  const secs = todayDate.getSeconds().toString().padStart(2, 0);

  date.innerHTML = `${weekDay}, ${month} ${todaysDate} ${year}`;
  time.innerHTML = `${hours}:${mins}:${secs}`;
}, 1000);

const getData = async (url) => {
  const res = await fetch(url);
  const data = await res.json();

  return data;
};

const geoCoding = (cityName) => {
  const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&appid=44eeb0863b7b878491c01518d820a7af`;
  return getData(geocodingUrl);
};

const weatherFromLocation = (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=44eeb0863b7b878491c01518d820a7af`;
  return getData(url);
};

const todayWeather = (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=44eeb0863b7b878491c01518d820a7af`;
  return getData(url);
};

const getTime = (timeOfDay) => {
  let time;
  if (timeOfDay === "midnight") time = "00:00:00";
  if (timeOfDay === "before dawn") time = "03:00:00";
  if (timeOfDay === "dawn") time = "06:00:00";
  if (timeOfDay === "morning") time = "09:00:00";
  if (timeOfDay === "noon") time = "12:00:00";
  if (timeOfDay === "evening") time = "18:00:00";
  if (timeOfDay === "night") time = "21:00:00";

  return time;
};

const getDayTime = (time) => {
  let dayTime;
  if (time === "00:00:00" || time === "03:00:00" || time === "21:00:00") {
    dayTime = "night";
  } else {
    dayTime = "day";
  }

  return dayTime;
};

const dataToDisplay = (weatherData, time) => {
  let todaysWeather;
  let allDaysWeather;
  if (weatherData.list) {
    todaysWeather = weatherData.list[0];
    const otherDaysWeather = weatherData.list.filter((el) =>
      el.dt_txt.includes(time)
    );
    if (
      todaysWeather.dt_txt.includes(time) &&
      !otherDaysWeather.includes(todaysWeather)
    ) {
      allDaysWeather = [todaysWeather, ...otherDaysWeather];
    } else {
      allDaysWeather = otherDaysWeather;
    }
  }

  return allDaysWeather;
};

const getIcon = (main, desc, dayTime) => {
  switch (main) {
    case "Thunderstorm":
      if (dayTime === "night") {
        return "11n";
      } else return "11d";
    case "Drizzle":
      if (dayTime === "night") {
        return "09n";
      } else return "09d";
    case "Rain":
      if (desc === "freezing rain") {
        return "13d";
      } else if (
        desc === "ligh intensity shower rain" ||
        "shower rain" ||
        "heavy intensity shower rain" ||
        "ragged shower rain"
      ) {
        return "09d";
      } else {
        if (dayTime === "night") {
          return "10n";
        } else return "10d";
      }
    case "Snow":
      if (dayTime === "night") {
        return "13n";
      } else return "13d";
    case "Mist" ||
      "Smoke" ||
      "Haze" ||
      "Dust" ||
      "Fog" ||
      "Sand" ||
      "Ash" ||
      "Squal" ||
      "Tornado":
      if (dayTime === "night") {
        return "50n";
      } else return "50d";
    case "Clear":
      if (dayTime === "night") {
        return "01n";
      } else return "01d";
    case "Clouds":
      if (desc === "few clouds") {
        if (dayTime === "night") {
          return "02n";
        } else return "02d";
      } else if (desc === "scattered clouds") {
        return "03d";
      } else {
        return "04d";
      }

    default:
      return "";
  }
};

const getMap = (lat, lon) => {
  var container = L.DomUtil.get("map");
  if (container != null) {
    container._leaflet_id = null;
  }

  const map = L.map("map").setView([lat, lon], 5);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  L.marker([lat, lon]).addTo(map).openPopup();

  return map;
};

async function forcast(city, timeOfDay = "morning") {
  const data = await geoCoding(city);

  loc.innerHTML = `${data[0].name}, ${data[0].country}`;
  const lat = data[0].lat;
  const lon = data[0].lon;

  const weatherData = await weatherFromLocation(lat, lon);

  const time = getTime(timeOfDay);

  const dayTime = getDayTime(time);

  const allDaysWeather = dataToDisplay(weatherData, time);

  const today = weekDays[new Date().getDay()];
  const tomorrow = weekDays[new Date().getDay() + 1];

  const todaysWeather = await todayWeather(lat, lon);

  const todayCard = `
            <h1 class="weatherForcast__title">Today</h1>
            <div class="weatherForcast__today--desc">${
              todaysWeather.weather[0].description
            }</div>
            <img class="weatherForcast__today--icon" src="/assets/${getIcon(
              todaysWeather.weather[0].main,
              todaysWeather.weather[0].description,
              "day"
            )}@2x.png" alt="weather icon" />
            <div class="weatherForcast__today--infoContainer">
                <div class="weatherForcast__today--temp">
                ${Math.round(todaysWeather.main.temp - 273)}<sup>°C</sup>
                </div>
                <div class="weatherForcast__today--windHumidity">
                    <div class="weatherForcast__today--wind">humidity: <span>${
                      todaysWeather.main.humidity
                    }%</span></div>
                    <div class="weatherForcast__today--wind">wind speed: <span>${todaysWeather.wind.speed.toFixed(
                      1
                    )}km/h</span></div>
                    <div class="weatherForcast__today--wind">Pressure: <span>${
                      todaysWeather.main.pressure
                    } mbar</span></div>
                </div>
            </div>
    `;

  const list = allDaysWeather
    .map((dayWeather) => {
      const weekDay = weekDays[new Date(dayWeather.dt_txt).getDay()];
      const temp = Math.round(dayWeather.main.temp - 273);
      const main = dayWeather.weather[0].main;
      const desc = dayWeather.weather[0].description;
      const windSpeed = Math.round(dayWeather.wind.speed);
      const humidity = dayWeather.main.humidity;

      const card = `
    <article class="weatherCard">
          <p class="weatherCard__day">${
            weekDay === today
              ? "Today"
              : weekDay === tomorrow
              ? "Tomorrow"
              : weekDay
          }</p>
          <div class="weatherCard__desc">${desc}</div>
          <img class="weatherCard__icon" src="/assets/${getIcon(
            main,
            desc,
            dayTime
          )}@2x.png" alt="weather icon" />
          <div class="weatherCard__temp">
          ${temp}<sup>°C</sup>
          </div>
          <div class="weatherCard__wind">humidity: <span>${humidity}%</span></div>
          <div class="weatherCard__wind">wind speed: <span>${windSpeed} km/h</span></div>
    </article>
  `;
      return card;
    })
    .join(" ");

  weatherForcast.innerHTML = list;
  weatherForcastToday.innerHTML = "";
  weatherForcastToday.insertAdjacentHTML("beforeend", todayCard);

  getMap(lat, lon);
}

window.addEventListener("load", async function () {
  forcast("algiers");
});

submitBtn.addEventListener("click", async function (e) {
  e.preventDefault();
  forcast(inputValue.value);
});

select.addEventListener("change", async function (e) {
  forcast(inputValue.value, e.target.value);
});

// ====================== CONFIG ======================
const API_KEY = "26c37726155f2571e8f0c09893ff84e9";
// If you later use the Node proxy, set USE_PROXY = true and PROXY_URL = '/weather'
const USE_PROXY = false;
const PROXY_URL = "/weather";
// ====================== END CONFIG ======================

/* DOM */
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locBtn = document.getElementById('locBtn');
const clearBtn = document.getElementById('clearBtn');
const msg = document.getElementById('msg');
const weatherBox = document.getElementById('weatherBox');

const iconDiv = document.getElementById('icon');
const tempDiv = document.getElementById('temp');
const descDiv = document.getElementById('desc');
const placeDiv = document.getElementById('place');
const feelsDiv = document.getElementById('feels');
const humidityDiv = document.getElementById('humidity');
const windDiv = document.getElementById('wind');
const sunDiv = document.getElementById('sun');

function setMsg(text) { msg.textContent = text || ''; }
function showWeatherBox(show = true) { weatherBox.hidden = !show; }

/* Helper: build fetch URL */
function buildUrlByCity(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`;
  if (USE_PROXY) return `${PROXY_URL}?url=${encodeURIComponent(url)}`;
  return url;
}
function buildUrlByCoords(lat, lon){
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
  if (USE_PROXY) return `${PROXY_URL}?url=${encodeURIComponent(url)}`;
  return url;
}

/* Fetch + error handling */
async function fetchWeather(url) {
  setMsg('Loading...');
  showWeatherBox(false);
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log('API response:', data);
    if (!res.ok || data.cod && +data.cod !== 200) {
      // Data often contains {"cod":"404","message":"city not found"} or cod 401
      const code = data.cod || res.status;
      const message = data.message || res.statusText || 'Unknown error';
      setMsg(`Error ${code}: ${message}`);
      return null;
    }
    setMsg('');
    return data;
  } catch (err) {
    console.error(err);
    setMsg('Network error — check console.');
    return null;
  }
}

/* Render */
function render(data){
  if(!data) return;
  const w = data.weather[0];
  iconDiv.innerHTML = `<img alt="${w.description}" src="https://openweathermap.org/img/wn/${w.icon}@2x.png">`;
  tempDiv.textContent = `${Math.round(data.main.temp)}°C`;
  descDiv.textContent = `${w.description}`;
  placeDiv.textContent = `${data.name}, ${data.sys.country}`;
  feelsDiv.textContent = `Feels: ${Math.round(data.main.feels_like)}°C`;
  humidityDiv.textContent = `Humidity: ${data.main.humidity}%`;
  windDiv.textContent = `Wind: ${data.wind.speed} m/s`;
  const sr = new Date(data.sys.sunrise * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  const ss = new Date(data.sys.sunset * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
  sunDiv.textContent = `Sun: ${sr} — ${ss}`;
  showWeatherBox(true);
}

/* Actions */
async function getWeatherByCity(city){
  const url = buildUrlByCity(city);
  const data = await fetchWeather(url);
  if (data) render(data);
}

async function getWeatherByCoords(lat, lon){
  const url = buildUrlByCoords(lat, lon);
  const data = await fetchWeather(url);
  if (data) render(data);
}

/* Bind events */
searchBtn?.addEventListener('click', ()=> {
  const city = cityInput.value.trim();
  if(!city){ setMsg('Please enter a city'); return; }
  getWeatherByCity(city);
});
cityInput?.addEventListener('keypress', (e)=> { if(e.key === 'Enter') searchBtn.click(); });
locBtn?.addEventListener('click', ()=> {
  if(!navigator.geolocation){ setMsg('Geolocation unsupported'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{
    getWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
  }, err=>{
    setMsg('Location denied or unavailable');
  }, {timeout:10000});
});
clearBtn?.addEventListener('click', ()=> {
  cityInput.value = '';
  setMsg('');
  showWeatherBox(false);
});

/* initial sample */
getWeatherByCity('Mumbai');

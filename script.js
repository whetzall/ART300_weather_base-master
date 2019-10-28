


let nws; 
/* ZIP CODE FUNCTIONS */
let zip = "";
const zip_input = document.getElementById('zip');
zip_input.addEventListener('input', zipTest);

// let lat = 40.75;
// let lon = -73.92;
let gridX;
let gridY;

var weather = {
	error: "",

    city: "",
	location: {
		zip: "",
		coord: {
			lat: "",
			lon: ""
		},
		name: "",
		state: ""
	},
	

	time:{
		day:"",
		date:"",
		hour_24:"",
		hour_12: "",
		minute:"",
		seconds:"",
		ampm:"",
		moom: ""
	},
	
	current: {
		description: {
			main: "",
			long: "",
			icon: "",
		},
		temp:{
			current: "",
			high: "",
			low: "",
		},
		wind: {
			speed: "",
			degree: "",
			direction: ""	
		},

		humidity: "",
		pressure:"",
		cloud_cover: "",

		parcipitation: {
			rain: "",
			snow: "",

		},

		sunrise: "",
		sunset: "",
		moon_phase: ""
	},

	hourly: [
		{},
		{},
		{},
		{},
		{},
		{},
		{},
		{},
		{},
		{},
		{},
		{},
	],

	forecast: [
		{ weather:"" },
		{ weather:"" },
		{ weather:"" },
		{ weather:"" },
		{ weather:"" },
		{ weather:"" },
		{ weather:"" }
	],
	end: ""
}




if (getParameterByName('zip')) {
    zip = getParameterByName('zip');
}

function zipTest() {
	var zipEl =document.getElementById('zip').value;

	var test_zip = zipEl.replace(/\D/g, '');
    var regex = /(^\d{5}$)|(^\d{5}-\d{4}$)/g;
    var found = test_zip.match(regex);

    if (found) {
        zip_input.blur();
        if (found[0] !== zip) {
			zip = found[0];
			weather.location.zip = zip; 
			getCurrent(zip);
			getForecast(zip);
        }
    }
}


function myzip(){
	zipTest("myzip");
}


/* WEATHER RETRIEVAL AND PARSING FUNCTIONS */

function getCurrent(z) {
    let toFetchCurrent = "https://api.openweathermap.org/data/2.5/weather?zip=" + z + ",us&appid=" + Keys.openweathermap;
	
	fetch(toFetchCurrent)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
			mapCurrentResultsToState(myJson);
			if(myJson.coord.lat !== undefined && myJson.coord.lon !== undefined){
				getHourlyForcast( myJson.coord.lat, myJson.coord.lon);
				destroyMap();
				my_initMap( myJson.coord.lat, myJson.coord.lon, 9 );
			}
        });

    
}

function mapCurrentResultsToState(j) {

	if (j.cod === "404" || j.cod === "401" ) {
		weather.error = j.message;
    } else {
		weather.location.name = j.name;
		weather.city = j.name;
		weather.location.coord = j.coord;
		weather.current.description_main = j.weather[0].main;
		weather.current.description_long = j.weather[0].description;
		weather.current.description_icon = j.weather[0].icon;
		weather.current.temp.current = kelvinToFahrenheit(j.main.temp);
		weather.current.temp.high = kelvinToFahrenheit(j.main.temp_max);
		weather.current.temp.low = kelvinToFahrenheit(j.main.temp_min);

		weather.current.pressure = j.main.pressure;
		weather.current.humidity= j.main.humidity;
	
		weather.current.wind.speed = j.wind.speed + "mph";
		weather.current.wind.degree = j.wind.deg;
		weather.current.cloud_cover = j.clouds.all;
		
		var sunrise = new Date(j.sys.sunrise*1000);
		weather.current.sunrise = formatDate(sunrise, "h:mmtt");

		var sunset = new Date(j.sys.sunset*1000);
		weather.current.sunset = formatDate(sunset, "h:mmtt");
	}

}



function getForecast(z) {
	let toFetchForecast = "https://api.weatherbit.io/v2.0/forecast/daily?postal_code=" + z + "&country=US&units=I&key="+Keys.weatherbit;

	fetch(toFetchForecast,{
		method: 'GET',
		mode: "cors",
		headers: { 'Content-Type': 'application/json' }
	}).then(function (response) {
			return response.json();
		}).then(function (myJson) {
			mapForecastResultsToState(myJson);
		});
}

function mapForecastResultsToState(j) {
	if (j.cod === "404" || j.cod === "401" ) {
		weather.error = j.message;
    } else {
		console.log(j);
		weather.forecast = [];
		j.data.forEach(function(element) {
			weather.forecast.push(element);
			weather.location.state = j.state_code;
		});
    }
}



function getHourlyForcast( lat, lon ){
	let toFetch = "https://api.weather.gov/points/" + lat + "," + lon;

    fetch(toFetch)
    .then(function(response) {
        return response.json();
    })
    .then(function(myJson) {
        nws = myJson;
        gridX = nws.properties.gridX;
        gridY = nws.properties.gridY;
    }).then(function(){
        let gridFetch = "https://api.weather.gov/gridpoints/TOP/"+gridX+","+gridY+"/forecast/hourly"
        fetch(gridFetch).then(function(response) {
            return response.json();
        })
        .then(function(myJson) {
			weather.hourly = myJson.properties.periods;
        })
    });
}



function destroyMap(){
	var currentMap = document.querySelector('#map');
	var temp = document.createElement('div');
	temp.setAttribute("id", "temp");
	currentMap.insertAdjacentElement('afterend',temp);
	currentMap.parentNode.removeChild(currentMap);

	var newMap = document.createElement('div');
	newMap.setAttribute("id", "map");
	temp.insertAdjacentElement('afterend',newMap);
	temp.parentNode.removeChild(temp);
}






/* DATE FUNCTIONS */


var week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
var timerID = setInterval(updateTime, 1000);

updateTime();
function updateTime() {
	var cd = new Date();
	weather.time.day = week[cd.getDay()];
	weather.time.ampm = weather.time.hour >= 12 ? 'am' : 'pm';
	weather.time.hour_24 = zeroPadding(cd.getHours(), 2);
	weather.time.hour_12 = weather.time.hour_24 % 12;
	weather.time.minute = zeroPadding(cd.getMinutes(), 2);
	weather.time.seconds = zeroPadding(cd.getSeconds(), 2);
	weather.time.date =  zeroPadding(cd.getFullYear(), 4) + '-' + zeroPadding(cd.getMonth()+1, 2) + '-' + zeroPadding(cd.getDate(), 2);
	weather.time.moom = Moon.phase( zeroPadding(cd.getFullYear(), 4), zeroPadding(cd.getMonth()+1, 2), zeroPadding(cd.getDate(), 2) );
};

function zeroPadding(num, digit) {
    var zero = '';
    for(var i = 0; i < digit; i++) {
        zero += '0';
    }
    return (zero + num).slice(-digit);
}









/* HELPER FUNCTIONS */

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function kelvinToFahrenheit(tempK) {
    // Convert from Kelvin to Fahrenheit
    //T(°F) = T(K) × 9/5 - 459.67
    let tempF = parseInt((tempK * 1.8) - 459.67, 10);
    return tempF;
}

function formatDate(date, format, utc) {
    var MMMM = ["\x00", "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var MMM = ["\x01", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var dddd = ["\x02", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ddd = ["\x03", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    function ii(i, len) {
        var s = i + "";
        len = len || 2;
        while (s.length < len) s = "0" + s;
        return s;
    }

    var y = utc ? date.getUTCFullYear() : date.getFullYear();
    format = format.replace(/(^|[^\\])yyyy+/g, "$1" + y);
    format = format.replace(/(^|[^\\])yy/g, "$1" + y.toString().substr(2, 2));
    format = format.replace(/(^|[^\\])y/g, "$1" + y);

    var M = (utc ? date.getUTCMonth() : date.getMonth()) + 1;
    format = format.replace(/(^|[^\\])MMMM+/g, "$1" + MMMM[0]);
    format = format.replace(/(^|[^\\])MMM/g, "$1" + MMM[0]);
    format = format.replace(/(^|[^\\])MM/g, "$1" + ii(M));
    format = format.replace(/(^|[^\\])M/g, "$1" + M);

    var d = utc ? date.getUTCDate() : date.getDate();
    format = format.replace(/(^|[^\\])dddd+/g, "$1" + dddd[0]);
    format = format.replace(/(^|[^\\])ddd/g, "$1" + ddd[0]);
    format = format.replace(/(^|[^\\])dd/g, "$1" + ii(d));
    format = format.replace(/(^|[^\\])d/g, "$1" + d);

    var H = utc ? date.getUTCHours() : date.getHours();
    format = format.replace(/(^|[^\\])HH+/g, "$1" + ii(H));
    format = format.replace(/(^|[^\\])H/g, "$1" + H);

    var h = H > 12 ? H - 12 : H == 0 ? 12 : H;
    format = format.replace(/(^|[^\\])hh+/g, "$1" + ii(h));
    format = format.replace(/(^|[^\\])h/g, "$1" + h);

    var m = utc ? date.getUTCMinutes() : date.getMinutes();
    format = format.replace(/(^|[^\\])mm+/g, "$1" + ii(m));
    format = format.replace(/(^|[^\\])m/g, "$1" + m);

    var s = utc ? date.getUTCSeconds() : date.getSeconds();
    format = format.replace(/(^|[^\\])ss+/g, "$1" + ii(s));
    format = format.replace(/(^|[^\\])s/g, "$1" + s);

    var f = utc ? date.getUTCMilliseconds() : date.getMilliseconds();
    format = format.replace(/(^|[^\\])fff+/g, "$1" + ii(f, 3));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])ff/g, "$1" + ii(f));
    f = Math.round(f / 10);
    format = format.replace(/(^|[^\\])f/g, "$1" + f);

    var T = H < 12 ? "AM" : "PM";
    format = format.replace(/(^|[^\\])TT+/g, "$1" + T);
    format = format.replace(/(^|[^\\])T/g, "$1" + T.charAt(0));

    var t = T.toLowerCase();
    format = format.replace(/(^|[^\\])tt+/g, "$1" + t);
    format = format.replace(/(^|[^\\])t/g, "$1" + t.charAt(0));

    var tz = -date.getTimezoneOffset();
    var K = utc || !tz ? "Z" : tz > 0 ? "+" : "-";
    if (!utc) {
        tz = Math.abs(tz);
        var tzHrs = Math.floor(tz / 60);
        var tzMin = tz % 60;
        K += ii(tzHrs) + ":" + ii(tzMin);
    }
    format = format.replace(/(^|[^\\])K/g, "$1" + K);

    var day = (utc ? date.getUTCDay() : date.getDay()) + 1;
    format = format.replace(new RegExp(dddd[0], "g"), dddd[day]);
    format = format.replace(new RegExp(ddd[0], "g"), ddd[day]);

    format = format.replace(new RegExp(MMMM[0], "g"), MMMM[M]);
    format = format.replace(new RegExp(MMM[0], "g"), MMM[M]);

    format = format.replace(/\\(.)/g, "$1");

    return format;
}





























































/**
 * This file is licensed under Creative Commons Zero (CC0)
 * http://creativecommons.org/publicdomain/zero/1.0/
 *
 * Author: http://www.openstreetmap.org/user/Zartbitter
 */

 /**
 * Internationalization of some texts used by the map.
 * @param String key the key of the text item
 * @param String lang the language id
 * @return String the localized text item or the id if there's no translation found
 */
function getI18n(key, lang) {
	var i18n = {
		en: {
			  maps: 'Maps'
			, layers: 'TileLayer'
			, current: 'Current Weather'

			, clouds: 'Clouds'
			, cloudscls: 'Clouds (classic)'
			, precipitation: 'Precipitation'
			, precipitationcls: 'Precipitation (classic)'
			, rain: 'Rain'
			, raincls: 'Rain (classic)'
			, snow: 'Snow'
			, temp: 'Temperature'
			, windspeed: 'Wind Speed'
			, pressure: 'Pressure'
			, presscont: 'Pressure Contour'

			, city: 'Cities'
			, windrose: 'Wind Rose'

			, prefs: 'Preferences'
			, scrollwheel: 'Scrollwheel'
			, on: 'on'
			, off: 'off'
		}
		, it: {
			  maps: 'Mappe'
			, layers: 'Livelli Meteo'
			, current: 'Meteo Corrente'

			, clouds: 'Nuvole'
			, cloudscls: 'Nuvole (classico)'
			, precipitation: 'Precipitazioni'
			, precipitationcls: 'Precipitazioni (classico)'
			, rain: 'Pioggia'
			, raincls: 'Pioggia (classico)'
			, snow: 'Neve'
			, temp: 'Temperatura'
			, windspeed: 'Velocità del Vento'
			, pressure: 'Pressione'
			, presscont: 'Contorno Pressione'

			, city: 'Città'
			, windrose: 'Rosa dei Venti'

			, prefs: 'Preferenze'
			, scrollwheel: 'Scrollwheel'
			, on: 'on'
			, off: 'off'
		}
		, de: {
			  maps: 'Karten'
			, layers: 'Ebenen'
			, current: 'Aktuelles Wetter'

			, clouds: 'Wolken'
			, cloudscls: 'Wolken (classic)'
			, precipitation: 'Niederschläge'
			, precipitationcls: 'Niederschläge (classic)'
			, rain: 'Regen'
			, raincls: 'Regen (classic)'
			, snow: 'Schnee'
			, temp: 'Temperatur'
			, windspeed: 'Windgeschwindigkeit'
			, pressure: 'Luftdruck'
			, presscont: 'Isobaren'

			, city: 'Städte'
			, windrose: 'Windrose'

			, prefs: 'Einstellungen'
			, scrollwheel: 'Scrollrad'
			, on: 'an'
			, off: 'aus'
		}
		, fr: {
			  maps: 'Carte'
			, layers: 'Couches'
			, current: 'Temps actuel'

			, clouds: 'Nuage'
			, cloudscls: 'Nuage (classique)'
			, precipitation: 'Précipitations'
			, precipitationcls: 'Précipitations (classique)'
			, rain: 'Pluie'
			, raincls: 'Pluie (classique)'
			, snow: 'Neiges'
			, temp: 'Température'
			, windspeed: 'Vitesse du vent'
			, pressure: 'Pression de l\'air'
			, presscont: 'Isobare'

			, city: 'Villes'
			, windrose: 'Boussole'

			, prefs: 'Paramètres'
			, scrollwheel: 'Molette'
			, on: 'allumé'
			, off: 'éteint'
		}
		, ru: {
			  maps: 'карта'
			, layers: 'слой'
			, current: 'текущая погода'

			, clouds: 'о́блачность'
			, cloudscls: 'о́блачность (класси́ческий)'
			, precipitation: 'оса́дки'
			, precipitationcls: 'оса́дки (класси́ческий)'
			, rain: 'дождь'
			, raincls: 'дождь (класси́ческий)'
			, snow: 'снег'
			, temp: 'температу́ра'
			, windspeed: 'ско́рость ве́тра'
			, pressure: 'давле́ние'
			, presscont: 'изоба́ра'

			, city: 'города'
			, windrose: 'направление ветра'

			, prefs: 'настройки'
			, scrollwheel: 'колесо прокрутки'
			, on: 'вкл'
			, off: 'выкл'
		}
		, nl: {
			  maps: 'Kaarten'
			, layers: 'Lagen'
			, current: 'Actuele Weer'

			, clouds: 'Wolken'
			, cloudscls: 'Wolken (classic)'
			, precipitation: 'Neerslag'
			, precipitationcls: 'Neerslag (classic)'
			, rain: 'Regen'
			, raincls: 'Regen (classic)'
			, snow: 'Sneeuw'
			, temp: 'Temparatuur'
			, windspeed: 'Windsnelheid'
			, pressure: 'Luchtdruk'
			, presscont: 'Isobare'

			, city: 'Steden'
			, windrose: 'Wind roos'

			, prefs: 'Instellingen'
			, scrollwheel: 'Muis wieltje'
			, on: 'aan'
			, off: 'uit'
		},
		pt_br: {
			  maps: 'Mapas'
			, layers: 'Camadas'
			, current: 'Meteorologia atual'

			, clouds: 'Núvens'
			, cloudscls: 'Núvens (clássico)'
			, precipitation: 'Precipitação'
			, precipitationcls: 'Precipitação (clássico)'
			, rain: 'Chuva'
			, raincls: 'Chuva (clássico)'
			, snow: 'Neve'
			, temp: 'Temperatura'
			, windspeed: 'Velocidade do Vento'
			, pressure: 'Pressão Atmosférica'
			, presscont: 'Pressão Atmosférica (linhas)'

			, city: 'Cidades'
			, windrose: 'Rosa dos ventos'

			, prefs: 'Configurações'
			, scrollwheel: 'Rodinha do mouse'
			, on: 'ligado'
			, off: 'desligado'
		},
		es: {
			  maps: 'Mapas'
			, layers: 'Láminas'
			, current: 'Tiempo actual'

			, clouds: 'Nubes'
			, cloudscls: 'Nubes (classic)'
			, precipitation: 'Precipitaciones'
			, precipitationcls: 'Precipitaciones (classic)'
			, rain: 'llover'
			, raincls: 'llover (classic)'
			, snow: 'Nevada'
			, temp: 'Temperatura'
			, windspeed: 'Velocidad del viento'
			, pressure: 'Presión atmosférica'
			, presscont: 'Isobaras'

			, city: 'Urbes'
			, windrose: 'Tarjeta brújula'

			, prefs: 'Preferencias'
			, scrollwheel: 'Rueda de desplazamiento'
			, on: 'encendido'
			, off: 'apagado'
		},
		ca: {
			  maps: 'Mapas'
			, layers: 'Láminas'
			, current: 'Tiempo actual'

			, clouds: 'Nubes'
			, cloudscls: 'Nubes (classic)'
			, precipitation: 'Precipitaciones'
			, precipitationcls: 'Precipitaciones (classic)'
			, rain: 'llover'
			, raincls: 'llover (classic)'
			, snow: 'Nevada'
			, temp: 'Temperatura'
			, windspeed: 'Velocidad del viento'
			, pressure: 'Presión atmosférica'
			, presscont: 'Isobaras'

			, city: 'Urbes'
			, windrose: 'Tarjeta brújula'

			, prefs: 'Preferencias'
			, scrollwheel: 'Rueda de desplazamiento'
			, on: 'encendido'
			, off: 'apagado'
		},
		fa: {
		    maps: 'نقشه ها'
			, layers: 'لایه ها'
			, current: 'آب و هوای کنونی'

			, clouds: 'ابر ها'
			, cloudscls: 'ابر ها(کلاسیک)'
			, precipitation: 'بارش'
			, precipitationcls: 'بارش(کلاسیک)'
			, rain: 'باران'
			, raincls: 'باران(کلاسیک)'
			, snow: 'برف'
			, temp: 'دما'
			, windspeed: 'سرعت باد'
			, pressure: 'فشار '
			, presscont: 'پربند فشار'

			, city: 'شهرها'
			, windrose: 'گلباد'

			, prefs: 'Preferences'
			, scrollwheel: 'اسکرول ماوس'
			, on: 'روشن'
			, off: 'خاموش'
		}
	};

	if (typeof i18n[lang] != 'undefined'
			&& typeof i18n[lang][key] != 'undefined') {
		return  i18n[lang][key];
	}
	return key;
}

/**
 * Try to find a language we shoud use. Look for URL parameter or system settings.
 * Restricts to supported languages ('en', 'fr', 'ru', 'de' and some others).
 * @return String language code like 'en', 'fr', 'ru', 'de' or others
 */
function getLocalLanguage() {
	var lang = null;

	// 1. try to read URL parameter 'lang'
	var qs = window.location.search;
	if (qs) {
		if (qs.substring(0, 1) == '?') {
			qs = qs.substring(1)
		}
		var params = qs.split('&')
		for(var i = 0; i < params.length; i++) {
			var keyvalue = params[i].split('=');
			if (keyvalue[0] == 'lang') {
				lang = keyvalue[1];
				break;
			}
		}
	}

	// 2. try to get browser or system language
	if (!lang) {
		var tmp = window.navigator.userLanguage || window.navigator.language;
		lang = tmp.split('-')[0];
	}

	// Use only supported languages, defaults to 'en'
	if (lang != 'en' && lang != 'it' && lang != 'de' && lang != 'fr' && lang != 'ru' && lang != 'nl' && lang != 'ca' && lang != 'es' && lang != 'pt_br') {
		lang = 'en';
	}
	return lang;
}

/**
 * END
 * I18N
 */



/**
 * Initialize the map.
 */
function my_initMap( l1, l2, z1 ) {

	var humanitarian = L.tileLayer('https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
		maxZoom: 17,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors</a> <a href="https://www.hotosm.org/" target="_blank">Tiles courtesy of Humanitarian OpenStreetMap Team</a>'
		});


	// Get your own free OWM API key at https://www.openweathermap.org/appid - please do not re-use mine!
	// You don't need an API key for this to work at the moment, but this will change eventually.
	var OWM_API_KEY = Keys.openweathermap;

	var clouds = L.OWM.clouds({opacity: 0.8, appId: OWM_API_KEY});
	var cloudscls = L.OWM.cloudsClassic({opacity: 0.5, appId: OWM_API_KEY});
	var precipitation = L.OWM.precipitation( {opacity: 0.5, appId: OWM_API_KEY} );
	var precipitationcls = L.OWM.precipitationClassic({opacity: 0.5, appId: OWM_API_KEY});
	var rain = L.OWM.rain({opacity: 0.5, appId: OWM_API_KEY});
	var raincls = L.OWM.rainClassic({opacity: 0.5, appId: OWM_API_KEY});
	var snow = L.OWM.snow({opacity: 0.5, appId: OWM_API_KEY});
	var pressure = L.OWM.pressure({opacity: 0.4, appId: OWM_API_KEY});
	var pressurecntr = L.OWM.pressureContour({opacity: 0.5, appId: OWM_API_KEY});
	var temp = L.OWM.temperature({opacity: 0.5, appId: OWM_API_KEY});
	var wind = L.OWM.wind({opacity: 0.5, appId: OWM_API_KEY});

	var localLang = 'en';
	var useGeolocation = false;
	var zoom = z1;
	var lat = l1; 
	var lon = l2;

	map = L.map('map', {
		center: new L.LatLng(lat, lon), zoom: zoom,
		layers: [humanitarian, clouds, precipitationcls]
	});
	map.attributionControl.setPrefix("");

	var baseMaps = {
		// "OSM Standard": standard
		"OSM Humanitarian": humanitarian
	//	, "ESRI Aerial": esri
	};

	var overlayMaps = {};
	overlayMaps[getI18n('clouds', localLang)] = clouds;
	// overlayMaps[getI18n('cloudscls', localLang)] = cloudscls;
	// overlayMaps[getI18n('precipitation', localLang)] = precipitation;
	overlayMaps[getI18n('precipitationcls', localLang)] = precipitationcls;
	overlayMaps[getI18n('rain', localLang)] = rain;
	overlayMaps[getI18n('snow', localLang)] = snow;

	var layerControl = L.control.layers(baseMaps, overlayMaps, {collapsed: true}).addTo(map);

	if (useGeolocation && typeof navigator.geolocation != "undefined") {
		navigator.geolocation.getCurrentPosition(foundLocation);
	}
}




/**
 * END
 * MAP INITIALIZE
 */




  /* VUE DATA BINDING */
var vm = new Vue({
	el: '#app',
	data: weather,
	methods: {
		zip_trigger: function (){
			myzip();
		}
	}
})
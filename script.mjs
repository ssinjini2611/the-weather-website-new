import { API_KEY } from './config.js';


// Keep track of the user's previous location
let previousLocation = '';

function ValidateEmail(mail) 
{
 if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail))
  {
    return (true)
  }
    alert("You have entered an invalid email address!")
    return (false)
}

// Handle the user's weather search request
function getWeather(event) {
	// Prevent the default form submission behavior
	event.preventDefault();

	// Get the user's location input and trim any leading/trailing whitespace
	const location = document.getElementById('location').value.trim();
  
  // Get the email input element
  const emailInput = document.getElementById('emailaddress').value.trim();

  // Get the value of the subscription checkbox
  const check = document.getElementById('subsc');
  
  if (check.checked == true) {
  
  var mailformat = "/^w+([.-]?w+)*@w+([.-]?w+)*(.w{2,3})+$/";
  
  if(!ValidateEmail(emailInput))
  {
    alert("You have entered an invalid email address!");   
    return;
  }
  }
  
  
  // Validate the user's input
	if (!location) {
		// Display an error message if the user did not enter a location
		alert('Please enter a valid location.');
		return;
	}

	// Check if the user has already searched for this location
	if (location === previousLocation) {
		// Display an error message if the user has already searched for this location
		alert('You have already searched for this location. Please enter a different location.');
		return;
	}

	// Store the user's current location for future reference
	previousLocation = location;

	// Build the API request URL using the user's location input and the API key
	const url = `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${API_KEY}`;

	// Fetch the weather data from the OpenWeatherMap API
	fetch(url)
		.then(response => response.json())
		.then(data => {
			// Handle any errors that occurred during the API request
			if (data.cod === '404') {
				// Display an error message if the user entered an invalid city name
				displayError('Enter Valid City.');
			} else if (data.cod === '200' && data.list.length === 0) {
				// Display an error message if no weather data was found for the given location
				displayError('No weather data found.');
			} else {
				// Display the weather data to the user
				  displayWeather(data);
          if (check.checked == true) {
            subscribeToUpdates(location, emailInput);
          }
        // 
        // END CALL
			}
		})
		.catch(error => {
			// Display an error message if an unexpected error occurred while fetching weather data
			alert('An error occurred while fetching weather data. Please try again later.');
			console.error(error);
		});
}

//subscribption
async function subscribeToUpdates(location, emailInput) {
  
  
  // Send a POST request to your server with the email address
  await fetch('/subscribe', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email: emailInput, location: location })
  })
  .then(response=>response.json())
  .then(response => {
    console.log("res : " + response.status)
    if (response.status) {
     
    } else {
      throw new Error('Failed to subscribe');
    }
  })
  .catch(error => {
    console.error(error);
    alert('Failed to subscribe. Please try again later.');
  });

}


// This function is called to display an error message on the weather section of the webpage
function displayError(message) {
  // Get the HTML element with ID 'weather' to display the error message
  const weatherSection = document.getElementById('weather');
  // Set the inner HTML of the weather section to the error message passed as argument
  weatherSection.innerHTML = `<p>${message}</p>`;
  // Clear the HTML content of the element with ID 'hourly'
  document.getElementById('hourly').innerHTML = '';
  // Clear the HTML content of the element with ID 'current-weather'
  document.getElementById('current-weather').innerHTML = '';
}




// This function takes in data from the OpenWeatherMap API and displays it on the page.
function displayWeather(data) {

	// Get the 'weather' section of the HTML page.
	const weatherSection = document.getElementById('weather');
	// Clear any existing HTML in the 'weather' section.
	weatherSection.innerHTML = '';

	// Check if there are no results found for the given city.
	if (data.cod === '404') {
		// Display 'No results found' message in the 'weather' section.
		weatherSection.innerHTML = '<p>No results found.</p>';
		// Exit the function since there is no data to display.
		return;
	}

	// Extract relevant data from the API response.
	const city = data.city.name;
	const country = data.city.country;
	const current = data.list[0];
	const forecast = data.list.slice(1, 4);
	const sunriseTime = new Date(data.city.sunrise * 1000);
	const sunsetTime = new Date(data.city.sunset * 1000);

	// Get the UTC offset in hours.
	const offset = data.city.timezone / 3600;

	// Create a new date object with the adjusted UTC offset.
	const sunriseTimeAdjusted = new Date(sunriseTime.getTime() + offset * 60 * 60 * 1000);
	const sunsetTimeAdjusted = new Date(sunsetTime.getTime() + offset * 60 * 60 * 1000);

	// Format the sunrise and sunset times for display.
	const sunriseTimeString = sunriseTimeAdjusted.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
	const sunsetTimeString = sunsetTimeAdjusted.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

	// Create HTML for the current weather section.
	const currentHtml = `
		<h2>${city}, ${country}</h2>
		<div class="current">
			<h3>Current Weather</h3>
			<p class="temperature-large">${Math.round(current.main.temp - 273.15)}&deg;C</p>
			<p class="description-large">${current.weather[0].description}</p>
			<img src="https://openweathermap.org/img/w/${current.weather[0].icon}.png" alt="${current.weather[0].description}">
			<p id="feels like">Feels like ${Math.round(current.main.feels_like - 273.15)}&deg;C</p>
			<p>Sunrise time: ${sunriseTimeString}</p>
			<p>Sunset time: ${sunsetTimeString}</p>
		</div>
	`;


// Change the background image based on the weather conditions
const weatherConditions = current.weather[0].main;

// Get the body element from the HTML document
const body = document.body;

// Use a switch statement to set the background image based on the weather conditions
switch (weatherConditions) {
  case 'Thunderstorm':
    body.style.backgroundImage = "url('https://img.freepik.com/free-vector/realistic-lightning-bolts_23-2149146671.jpg?size=626&ext=jpg&ga=GA1.1.414568554.1681730826&semt=sph')";
    break;
  case 'Drizzle':
  case 'Rain':
  case 'Mist':
    body.style.backgroundImage = "url('https://img.freepik.com/free-vector/rain-with-falling-water-drops-white-background_1017-33600.jpg?size=626&ext=jpg&ga=GA1.2.414568554.1681730826&semt=sph')";
    break;
  case 'Snow':
    body.style.backgroundImage = "url('https://png.pngtree.com/thumb_back/fw800/back_pic/03/60/56/2057a5eaaf07ea7.jpg')";
    break;
  case 'Clear':
    body.style.backgroundImage = "url('https://img.freepik.com/free-photo/white-cloud-blue-sky-sea_1203-3021.jpg?size=626&ext=jpg&ga=GA1.2.414568554.1681730826&semt=ais')";
    break;
  case 'Clouds':
    body.style.backgroundImage = "url('https://png.pngtree.com/thumb_back/fh260/back_pic/00/04/81/115624fe1739a98.jpg')";
    break;
  default:
    body.style.backgroundImage = "url('https://img.freepik.com/free-photo/white-cloud-blue-sky-sea_1203-3021.jpg?size=626&ext=jpg&ga=GA1.2.414568554.1681730826&semt=ais')";
    break;
}



  
	// Add the HTML to the 'weather' section.
	weatherSection.innerHTML = currentHtml;


// Get the current date and time in UTC timezone
const currentDateTime = new Date();

// Get the timezone offset in minutes for the city
const timezoneOffset = data.city.timezone / 60;

// Create a HTML string to display a 3-day forecast
const forecastHtml = `
    <h2>3-day Forecast</h2>
    <div class="forecast">
        <!-- Map the next 3 days of the forecast data to HTML elements -->
        ${forecast.slice(0, 3).map((day, index) => {
            // Calculate the date for this day using the timezone offset
            const forecastDate = new Date(currentDateTime.getTime() + (24 * 60 * 60 * 1000 * (index + 1)));
            forecastDate.setMinutes(forecastDate.getMinutes() + timezoneOffset);
            
            return `
                <div class="day">
                
                    <h3>${forecastDate.toLocaleDateString('en-US', {weekday: 'long'})}</h3>
                    <p class="temperature">${Math.round(day.main.temp - 273.15)}&deg;C</p>
                    <p class="description">${day.weather[0].description}</p>
                    <img src="https://openweathermap.org/img/w/${day.weather[0].icon}.png" alt="${day.weather[0].description}">
                </div>
            `;
        }).join('')}
    </div>
`;




// Select the HTML element with ID "hourly" and clear its inner HTML
const hourlySection = document.getElementById('hourly');
hourlySection.innerHTML = '';

// Get the hourly forecast data for the next 12 hours
const hourlyForecast = data.list.slice(0, 12);

// Get the timezone offset in minutes for the city
const timezoneOffset1 = data.city.timezone / 60;

// Create the HTML markup for the hourly forecast section using the hourly forecast data
const hourlyHtml = `
    <h2>Hourly Forecast</h2>
    <div class="hourly-forecast">
        ${hourlyForecast.map(hour => {
            // Calculate the date and time for this hour using the timezone offset
            const hourDateTime = new Date(hour.dt_txt);
            hourDateTime.setMinutes(hourDateTime.getMinutes() + timezoneOffset1);
            
            return `
                <div class="hour">
                    <p class="time">${hourDateTime.toLocaleTimeString('en-US', {hour: 'numeric', minute: 'numeric', timeZone: 'UTC'})}</p>
                    <p class="temperature">${Math.round(hour.main.temp - 273.15)}&deg;C</p>
                    <p class="description">${hour.weather[0].description}</p>
                    <img src="https://openweathermap.org/img/w/${hour.weather[0].icon}.png" alt="${hour.weather[0].description}">
                </div>
            `;
        }).join('')}
    </div>
`;

// Set the inner HTML of the relevant HTML elements to the generated HTML
document.getElementById('current-weather').innerHTML = currentHtml;
weatherSection.innerHTML = forecastHtml;
hourlySection.innerHTML = hourlyHtml;

  

}

window.getWeather = getWeather;
window.displayError = displayError;
window.displayWeather = displayWeather;
window.subscribeToUpdates = subscribeToUpdates;

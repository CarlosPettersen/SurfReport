import React, { useState } from "react";
import axios from "axios";
import { Button, Box, Container, Input, Typography } from "@mui/material";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [inputCity, setInputCity] = useState("");
  // const API_KEY = "b0ecf3bcc25e5810d8c7b4e68bac182c";
  // const units = "metric";

  const handleInputChange = (e) => {
    setInputCity(e.target.value);
  };

  const fetchWeather = () => {
    // First, call the geocoding API to get latitude and longitude
    axios
      .get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${inputCity}&count=1&language=en&format=json`,
      )
      .then((response) => {
        const { latitude, longitude } = response.data.results[0];

        // Then, call both weather forecast APIs simultaneously
        return axios.all([
          axios.get(
            `https://marine-api.open-meteo.com/v1/marine?latitude=${latitude}&longitude=${longitude}&hourly=wave_height,wave_direction,wave_period&timezone=Australia%2FSydney`,
          ),
          axios.get(
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_direction_10m&timezone=Australia%2FSydney`,
          ),
        ]);
      })
      .then(
        axios.spread((marineResponse, forecastResponse) => {
          // Handle both responses here
          const marineData = marineResponse.data;
          const forecastData = forecastResponse.data;

          // Combine or process the data as needed

          // Update state with the combined data or whichever data you need
          setWeatherData({ marineData, forecastData });
          console.log(marineData, forecastData);
        }),
      )
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        setWeatherData(null);
      });
  };

  const getDirectionArrow = (degree) => {
    // Convert degree to compass direction
    const compassDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
    const index = Math.round(degree / 45) % 8;
    const direction = compassDirections[index];

    // Map compass direction to arrow character
    const arrowMap = {
      N: "↓",
      NE: "↙",
      E: "←",
      SE: "↖",
      S: "↑",
      SW: "↗",
      W: "→",
      NW: "↘",
    };

    return arrowMap[direction];
  };

  return (
    <Container>
      <Typography
        variant="h2"
        sx={{ mt: 4, mb: 2, textAlign: "center", color: "primary.main" }}
      >
        Weather Information
      </Typography>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}
      >
        <Input
          type="text"
          placeholder="Enter city"
          value={inputCity}
          onChange={handleInputChange}
          sx={{ mr: 2, width: "300px" }}
        />
        <Button variant="contained" onClick={fetchWeather}>
          Get Weather
        </Button>
      </Box>
      {weatherData && (
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Typography variant="h5">{inputCity}</Typography>
          <Typography variant="body1">
            Time | Wave Period | Wave Direction | Wave Height
          </Typography>
          {weatherData.marineData.hourly.time.map((time, index) => {
            const date = new Date(time);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1} at ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
            const waveDirectionDegree =
              weatherData.marineData.hourly.wave_direction[index];
            const directionArrow = getDirectionArrow(waveDirectionDegree);
            return (
              <Typography key={index} variant="body1">
                {formattedDate} |{" "}
                {weatherData.marineData.hourly.wave_period[index]}s |{" "}
                {directionArrow} |{" "}
                {weatherData.marineData.hourly.wave_height[index]}m
              </Typography>
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default Weather;

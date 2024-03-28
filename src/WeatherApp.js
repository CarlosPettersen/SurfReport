import React, { useState } from "react";
import axios from "axios";
import { Button, Box, Container, Input, Typography } from "@mui/material";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [inputCity, setInputCity] = useState("");
  const API_KEY = "b0ecf3bcc25e5810d8c7b4e68bac182c";
  const units = "metric";

  const handleInputChange = (e) => {
    setInputCity(e.target.value);
  };

  const fetchWeather = () => {
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&units=${units}&appid=${API_KEY}`,
      )
      .then((response) => {
        setWeatherData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        setWeatherData(null);
      });
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
          <Typography variant="h5">{weatherData.name}</Typography>
          <Typography variant="body1">{weatherData.main.temp}°C</Typography>
          {/* Add more weather data here */}
        </Box>
      )}
    </Container>
  );
};

export default Weather;

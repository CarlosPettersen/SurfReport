import React, { useState } from 'react';
import axios from 'axios';
import { styled } from '@mui/material/styles';
import { Button, Box, Stack, Input, Typography } from '@mui/material';

const Container = styled(Box)({
    padding: '20px',
    backgroundColor: '#f0f0f0',
    display: 'flex',
  });

const StackContainer = styled(Stack)({
    alignContent: 'center',
})

const Weather = () => {
const [weatherData, setWeatherData] = useState(null);
const [inputCity, setInputCity] = useState('');
const API_KEY = 'b0ecf3bcc25e5810d8c7b4e68bac182c';
const units = 'metric';

const handleInputChange = (e) => {
    setInputCity(e.target.value);
  };

  const fetchWeather = () => {
    axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${inputCity}&units=${units}&appid=${API_KEY}`)
      .then(response => {
        setWeatherData(response.data);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        setWeatherData(null);
      });
  };

  return (
    <Container>
        <Typography variant="h2">Weather Information</Typography>
        <StackContainer spacing={2} direction="row">
      <Input
        type="text"
        placeholder="Enter city"
        value={inputCity}
        onChange={handleInputChange}
      />
      <Button variant="contained" onClick={fetchWeather}>Get Weather</Button>
      {weatherData && (
        <Box>
          <Typography>{weatherData.name}</Typography>
          <Typography>{weatherData.main.temp}°C</Typography>
          {/* Add more weather data here */}
        </Box>
      )}
        </StackContainer>
    </Container>
  );
};

export default Weather;

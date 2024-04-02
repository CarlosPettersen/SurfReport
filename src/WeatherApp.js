import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Box,
  Container,
  Input,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [inputCity, setInputCity] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    setInputCity(e.target.value);
  };

  const fetchWeather = () => {
    setLoading(true);
    setError(null);
    axios
      .get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${inputCity}&count=1&language=en&format=json`,
      )
      .then((response) => {
        const { latitude, longitude } = response.data.results[0];

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
          const marineData = marineResponse.data;
          const forecastData = forecastResponse.data;

          setWeatherData({ marineData, forecastData });
          setLoading(false);
        }),
      )
      .catch((error) => {
        console.error("Error fetching weather data:", error);
        setError("Error fetching weather data. Please try again.");
        setLoading(false);
      });
  };

  const getDirectionArrow = (degree) => {
    const compassDirections = ["N", "NE", "E", "SE", "S", "SW", "W", "NW", "N"];
    const index = Math.round(degree / 45) % 8;
    const direction = compassDirections[index];
    const degreeValue = degree.toFixed(0); // Round the degree value to remove decimal points

    const arrowMap = {
      N: `↓ (${degreeValue}°)`,
      NE: `↙ (${degreeValue}°)`,
      E: `← (${degreeValue}°)`,
      SE: `↖ (${degreeValue}°)`,
      S: `↑ (${degreeValue}°)`,
      SW: `↗ (${degreeValue}°)`,
      W: `→ (${degreeValue}°)`,
      NW: `↘ (${degreeValue}°)`,
    };

    return arrowMap[direction];
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const isCurrentRow = (index) => {
    const date = new Date(weatherData.marineData.hourly.time[index]);
    return (
      currentDate.getFullYear() === date.getFullYear() &&
      currentDate.getMonth() === date.getMonth() &&
      currentDate.getDate() === date.getDate() &&
      currentDate.getHours() === date.getHours()
    );
  };

  const getWindSpeedColor = (windSpeed) => {
    if (windSpeed < 10) {
      return "#339933"; // Green for low wind speed
    } else if (windSpeed < 20) {
      return "#e6e600"; // Yellow for moderate wind speed
    } else {
      return "#cc0000"; // Red for high wind speed
    }
  };

  return (
    <Container style={{ backgroundColor: "#f0f0f0", padding: "20px" }}>
      <Typography
        variant="h2"
        align="center"
        style={{ marginBottom: "20px", color: "navy" }}
      >
        Weather Information
      </Typography>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Input
          type="text"
          placeholder="Enter city"
          value={inputCity}
          onChange={handleInputChange}
          style={{ marginRight: "10px", width: "300px" }}
        />
        <Button
          variant="contained"
          onClick={fetchWeather}
          style={{ backgroundColor: "navy", color: "white" }}
        >
          {loading ? "Loading..." : "Get Weather"}
        </Button>
      </Box>
      {error && (
        <Typography variant="body1" style={{ color: "red", marginTop: "10px" }}>
          {error}
        </Typography>
      )}
      {weatherData && (
        <Box style={{ marginTop: "20px" }}>
          <Typography variant="h5" align="center" style={{ color: "navy" }}>
            {inputCity}
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Wave Direction</TableCell>
                  <TableCell>Wave Period (s)</TableCell>
                  <TableCell>Wave Height (m)</TableCell>
                  <TableCell>Wind Direction</TableCell>
                  <TableCell>Wind Speed (km/h)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weatherData.marineData.hourly.time.map((time, index) => {
                  const date = new Date(time);
                  const formattedDate = `${date.getDate()}/${date.getMonth() + 1} at ${("0" + date.getHours()).slice(-2)}:${("0" + date.getMinutes()).slice(-2)}`;
                  const waveDirectionDegree =
                    weatherData.marineData.hourly.wave_direction[index];
                  const directionArrowWave =
                    getDirectionArrow(waveDirectionDegree);
                  const windDirectionDegree =
                    weatherData.forecastData.hourly.wind_direction_10m[index];
                  const directionArrowWind =
                    getDirectionArrow(windDirectionDegree);
                  const windSpeedColor = getWindSpeedColor(
                    weatherData.forecastData.hourly.wind_speed_10m[index],
                  );
                  return (
                    <TableRow
                      key={index}
                      style={
                        isCurrentRow(index)
                          ? { backgroundColor: "rgba(0, 0, 255, 0.1)" }
                          : {}
                      }
                    >
                      <TableCell>{formattedDate}</TableCell>
                      <TableCell>{directionArrowWave}</TableCell>
                      <TableCell>
                        {weatherData.marineData.hourly.wave_period[index]}
                      </TableCell>
                      <TableCell>
                        {weatherData.marineData.hourly.wave_height[index]}
                      </TableCell>
                      <TableCell>{directionArrowWind}</TableCell>
                      <TableCell style={{ backgroundColor: windSpeedColor }}>
                        {weatherData.forecastData.hourly.wind_speed_10m[index]}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      )}
    </Container>
  );
};

export default Weather;

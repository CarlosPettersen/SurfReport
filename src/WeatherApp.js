import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Autocomplete,
  Button,
  Box,
  Container,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useMediaQuery,
} from "@mui/material";

const Weather = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [inputCity, setInputCity] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const isMobile = useMediaQuery("(max-width:540px)");

  const handleInputChange = (e) => {
    const { value } = e.target;
    setInputCity(value);
    if (value.trim().length > 2) {
      fetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const fetchSuggestions = async (query) => {
    try {
      const response = await axios.get(
        `https://geocoding-api.open-meteo.com/v1/search?name=${query}&count=5&language=en&format=json`,
      );
      setSuggestions(
        response.data.results.map((result) => ({ name: result.name })),
      );
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
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
            `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=wind_speed_10m,wind_direction_10m,temperature_2m&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_sum,rain_sum&timezone=Australia%2FSydney`,
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
    }, 10000);

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
      return "rgb(76 137 76)"; // Green for low wind speed
    } else if (windSpeed < 20) {
      return "rgb(187 187 91)"; // Yellow for moderate wind speed
    } else {
      return "rgb(195 91 91)"; // Red for high wind speed
    }
  };

  return (
    <Container
      maxWidth="100%"
      style={{
        backgroundColor: "#222",
        padding: "20px",
        color: "#fff",
      }}
    >
      <Typography
        variant="h2"
        align="center"
        style={{ marginBottom: "20px", color: "#00bcd4" }}
      >
        Surf Spot
      </Typography>
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "row",
          flexWrap: "wrap",
        }}
      >
        <Autocomplete
          options={suggestions}
          getOptionLabel={(option) => option.name}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enter city"
              variant="filled"
              value={inputCity}
              onChange={handleInputChange}
              style={{
                marginRight: "10px",
                borderRadius: "10px",
                width: isMobile ? "200px" : "300px",
                backgroundColor: "#f0f0f0",
                color: "#222",
              }}
            />
          )}
          onChange={(event, value) => value && setInputCity(value.name)}
        />
        <Button
          variant="contained"
          onClick={fetchWeather}
          style={{
            backgroundColor: "rgb(47 107 115)",
            color: "#fff",
            marginTop: isMobile ? "10px" : "0px",
          }}
        >
          {loading ? "Loading..." : "Get surf forecast"}
        </Button>
      </Box>
      {error && (
        <Typography variant="body1" style={{ color: "red", marginTop: "10px" }}>
          {error}
        </Typography>
      )}
      {weatherData && (
        <Box style={{ marginTop: "20px" }}>
          <Box style={{ marginTop: "20px", textAlign: "center" }}>
            <Typography variant="h5" style={{ color: "#fff" }}>
              {inputCity}
            </Typography>
            <Typography variant="h6" style={{ color: "#fff" }}>
              Temperature:{" "}
              {
                weatherData.forecastData.hourly.temperature_2m[
                  currentDate.getHours()
                ]
              }
              °C ( Max:{" "}
              {
                weatherData.forecastData.daily.temperature_2m_max[
                  currentDate.getDay()
                ]
              }
              °C, Min:{" "}
              {
                weatherData.forecastData.daily.temperature_2m_min[
                  currentDate.getDay()
                ]
              }
              °C)
            </Typography>
            <Typography variant="body1" style={{ color: "#fff" }}>
              Sunrise:{" "}
              {new Date(
                weatherData.forecastData.daily.sunrise[0],
              ).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              | Sunset:{" "}
              {new Date(
                weatherData.forecastData.daily.sunset[0],
              ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </Typography>
          </Box>
          <TableContainer sx={{ maxHeight: 640 }}>
            <Table stickyHeader aria-label="sticky table">
              <TableHead>
                <TableRow>
                  <TableCell
                    style={{
                      color: "#00bcd4",
                      backgroundColor: "#222",
                    }}
                  >
                    Time
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#00bcd4",
                      backgroundColor: "#222",
                    }}
                  >
                    Wave Direction
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#00bcd4",
                      backgroundColor: "#222",
                    }}
                  >
                    Wave Period (s)
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#00bcd4",
                      backgroundColor: "#222",
                    }}
                  >
                    Wave Height (m)
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#00bcd4",
                      backgroundColor: "#222",
                    }}
                  >
                    Wind Direction
                  </TableCell>
                  <TableCell
                    style={{
                      color: "#00bcd4",
                      backgroundColor: "#222",
                    }}
                  >
                    Wind Speed (km/h)
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {weatherData.marineData.hourly.time.map((time, index) => {
                  const date = new Date(time);
                  const formattedDate = date.toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    hour: "numeric",
                    minute: "numeric",
                  });

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
                          ? { backgroundColor: "rgba(0, 188, 212, 0.5)" }
                          : {}
                      }
                    >
                      <TableCell style={{ color: "#fff" }}>
                        {formattedDate}
                      </TableCell>
                      <TableCell style={{ color: "#fff" }}>
                        {directionArrowWave}
                      </TableCell>
                      <TableCell style={{ color: "#fff" }}>
                        {weatherData.marineData.hourly.wave_period[index]}
                      </TableCell>
                      <TableCell style={{ color: "#fff" }}>
                        {weatherData.marineData.hourly.wave_height[index]}
                      </TableCell>
                      <TableCell style={{ color: "#fff" }}>
                        {directionArrowWind}
                      </TableCell>
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

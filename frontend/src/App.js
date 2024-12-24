import React, { useState } from 'react';
import { Box, Button, Container, Typography, TextField, Autocomplete, Dialog, DialogTitle, DialogContent, IconButton, Tooltip, Grid, Card, Paper, CardMedia, CardContent } from '@mui/material';
import { categoryOptions } from './categoryOptions';
import { useSpring, animated } from '@react-spring/web';
import axios from 'axios';
import Confetti from 'react-confetti'; 
import CloseIcon from '@mui/icons-material/Close';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import InputAdornment from '@mui/material/InputAdornment'
import Checkbox from '@mui/material/Checkbox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [location, setLocation] = useState('');
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [spinning, setSpinning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [highlightedRestaurant, setHighlightedRestaurant] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [randomlySelectedRestaurant, setRandomlySelectedRestaurant] = useState(null);
  const [distance, setDistance] = useState(5); 

  const distanceOptions = [
    { label: 'Default (5 miles)', value: 5 }, // Default option
    { label: '1 mile', value: 1 },
    { label: '2 miles', value: 2 },
    { label: '10 miles', value: 10 },
    { label: '15 miles', value: 15 },
    { label: '20 miles', value: 20 },
    { label: '25 miles', value: 25 },
  ];

  const fetchRestaurants = async () => {
    try {
      const requestData = {
        location,
        categories: categories.join(','), // Join category values
      };
  
      if (distance !== null) {
        requestData.radius = distance * 1609; // Convert miles to meters if distance is set
      }
  
      const response = await axios.post(`${API_BASE_URL}/restaurants`, requestData);
      console.log('restaurant data', response);
      setHasSearched(true);
      setRestaurants(response.data.data.slice(0, 100));
    } catch (error) {
      console.error('Error fetching restaurants:', error);
    }
  };

  const spinTable = () => {
    if (restaurants.length === 0) return;

    setSpinning(true);
    setRandomlySelectedRestaurant(null);
    setSelectedRestaurant(null);
    setHighlightedRestaurant(null); 
    setShowConfetti(false); 

    const spinDuration = 6000;
    const totalRestaurants = restaurants.length;

    let randomIndex = -1;
    const highlightInterval = setInterval(() => {
      randomIndex = Math.floor(Math.random() * totalRestaurants);
      setHighlightedRestaurant(restaurants[randomIndex]);
    }, 200);

    setTimeout(() => {
      setShowConfetti(true);
      clearInterval(highlightInterval);
      setSpinning(false);
      setRandomlySelectedRestaurant(restaurants[randomIndex]); 
      setHighlightedRestaurant(null); 
    }, spinDuration);
  };


  const clearFilters = () => {
    setCategories(''); 
    setRestaurants([]); 
    setSelectedRestaurant(null); 
    setHighlightedRestaurant(null);
    setShowConfetti(false); 
    setHasSearched(false);
    setDistance(5);
  };

  const renderStars = (rating) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;

    return (
      <Box display="flex" alignItems="center">
        {[...Array(fullStars)].map((_, index) => (
          <StarIcon key={`full-${index}`} sx={{ color: 'gold' }} />
        ))}
        {halfStar === 1 && <StarHalfIcon sx={{ color: 'gold' }} />}
        {[...Array(emptyStars)].map((_, index) => (
          <StarBorderIcon key={`empty-${index}`} sx={{ color: 'gold' }} />
        ))}
      </Box>
    );
  };

  const formatBusinessHours = (hours) => {
    if (!hours?.length) return [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return hours[0].open.reduce((acc, { day, start, end }) => {
      const dayName = days[day];
      const formattedStart = formatTime(new Date(`1970-01-01T${start.slice(0, 2)}:${start.slice(2)}:00`));
      const formattedEnd = formatTime(new Date(`1970-01-01T${end.slice(0, 2)}:${end.slice(2)}:00`));

      const entry = `${formattedStart} - ${formattedEnd}`;
      if (acc[dayName]) {
        acc[dayName] += `, ${entry}`;
      } else {
        acc[dayName] = entry;
      }

      return acc;
    }, {});
  };

  const formatTime = (date) => {
    const hours = date.getHours() % 12 || 12;
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
    return `${hours}:${minutes} ${ampm}`;
  };

  const springProps = useSpring({
    to: { transform: randomlySelectedRestaurant ? 'translateY(0)' : 'translateY(-100%)' },
    from: { transform: 'translateY(-100%)' },
    config: { tension: 100, friction: 10 },
  });


  return (
     <Container maxWidth="xl" sx={{ mt: 5 }}>
      <Box
        sx={{
          width: '100%',
          background: 'linear-gradient(90deg, #1976d2, #0d47a1)',
          padding: '10px 20px',
          textAlign: 'center',
          borderRadius: '8px',
          boxShadow: '8',
          display: 'flex', 
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold', letterSpacing: '1px' }}>
          What to eat?
        </Typography>
      </Box>
      <Typography variant="body1" align="center" sx={{ color: 'black', mt: 2, mb: 2 }}>
        Need help picking somewhere to eat? Enter your postal code below, select a category and search. You can then randomly select a restaurant! Problem solved!
      </Typography>
      <Box component="form" sx={{ mb: 4, display: 'flex', alignItems: 'center' }}>
      <TextField
            label="Enter Postal Code"
            variant="outlined"
            margin="normal"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ mr: 2, flex: 1 }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="Use current location">
                    <IconButton
                      onClick={() => {
                        if (navigator.geolocation) {
                          navigator.geolocation.getCurrentPosition(
                            (position) => {
                              const { latitude, longitude } = position.coords;
                              // Fetch postal code using reverse geocoding
                              axios
                                .get(
                                  `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
                                )
                                .then((response) => {
                                  const postalCode = response.data.address.postcode;
                                  setLocation(postalCode || '');
                                })
                                .catch((error) => {
                                  console.error('Error fetching postal code:', error);
                                });
                            },
                            (error) => {
                              console.error('Error getting location:', error);
                            }
                          );
                        } else {
                          console.error('Geolocation is not supported by this browser.');
                        }
                      }}
                    >
                      <LocationOnIcon />
                    </IconButton>
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        <Autocomplete
          disablePortal
          options={distanceOptions}
          getOptionLabel={(option) => option.label}
          value={distanceOptions.find((option) => option.value === distance) || null} // Ensure value is always defined
          renderInput={(params) => (
            <TextField {...params} label="Select Distance" variant="outlined" />
          )}
          onChange={(event, value) => setDistance(value?.value || null)} // Update distance state
          sx={{ mr: 2, flex: 1, mt: 1 }}
        />
        <Autocomplete
          multiple
          disablePortal
          options={categoryOptions}
          getOptionLabel={(option) => option.label}
          value={categoryOptions.filter((option) => categories.includes(option.value)) || []}
          renderOption={(props, option, { selected }) => {
            const { key, ...restProps } = props; // Destructure the key
            return (
              <li key={key} {...restProps}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankIcon fontSize="small" />}
                  checkedIcon={<CheckBoxIcon fontSize="small" />}
                  checked={selected}
                  style={{ marginRight: 8 }}
                />
                {option.label}
              </li>
            );
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select Categories"
              variant="outlined"
              sx={{ height: '100%', mt: 1 }}
            />
          )}
          onChange={(event, value) => {
            setCategories(value.map((option) => option.value));
            setHasSearched(false);
            setRestaurants([]);
          }}
          sx={{ mr: 2, flex: 1 }}
        />
        <Button
          variant="contained"
          sx={{ height: '55px', minWidth: '120px', mt: 1 }}
          onClick={fetchRestaurants}
          disabled={!location}
        >
          Search
        </Button>
        <Button
          variant="outlined"
          sx={{ height: '55px', minWidth: '120px', ml: 2, mt: 1 }}
          onClick={clearFilters}
        >
          Clear
        </Button>
      </Box>

      {hasSearched && restaurants.length === 0 && (
        <Box textAlign="center" sx={{ mt: 4 }}>
          <Typography variant="h6" color="textSecondary">
            😞 Sorry, no restaurants matched that criteria.
          </Typography>
        </Box>
      )}

      {restaurants.length > 0 && (
        <>
    <Box textAlign="center" sx={{ mt: 2 }}>
      <Button
        variant="contained"
        color="secondary"
        onClick={spinTable}
        disabled={spinning}
        sx={{ fontSize: '1.2rem' }}
      >
        {spinning ? (
          <>
            <span
              style={{
                animation: "spin 1s linear infinite",
                display: "inline-block",
              }}
            >
              🎲 
            </span>{" "}
            Selecting Random Restaurant
            <span
              style={{
                animation: "spin 1s linear infinite",
                display: "inline-block",
              }}
            >
              🎲
            </span>{" "}
          </>
        ) : (
          "🎲 Randomly Select a Restaurant 🎲"
        )}
      </Button>
    </Box>
    <style>
      {`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}
    </style>

        <Paper elevation={3} sx={{ p: 2, mt: 2  }}>
          <Grid container spacing={2}>
            {restaurants.map((restaurant) => (
              <Grid item xs={12} sm={2} key={restaurant.id} sx={{ justifyContent: 'center' }}>
        <Card
          sx={{
            height: '100%',
            cursor: 'pointer',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            '&:hover': {
              transform: 'scale(1.05)', 
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)',
            },
            ...(highlightedRestaurant?.id === restaurant.id && {
              transform: 'scale(1.5)',
              boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.2)', 
            }),
            ...(selectedRestaurant?.id === restaurant.id && {
              backgroundColor: 'rgba(0, 255, 0, 0.3)',
              boxShadow: '0 0 10px rgba(0, 255, 0, 0.5)',
            }),
          }}
          onClick={() => {
            setSelectedRestaurant(restaurant); 
            setShowConfetti(false);
          }}
        >
          <CardMedia
            component="img"
            alt={restaurant.name}
            height="100"
            image={restaurant.image_url || './default-image.jpg'}
          />
          <CardContent>
            <Typography sx={{fontWeight: 'bold', fontSize: '1rem'}}>{restaurant.name}</Typography>
            <Box display="flex" alignItems="center">
              {renderStars(restaurant.rating || 0)}
              <Typography variant="body1" sx={{ ml: 1 }}>
                ({restaurant.rating || 'N/A'})
              </Typography>
            </Box>
          </CardContent>
        </Card>


              </Grid>
            ))}
          </Grid>
          </Paper>

          {/* Dialog for Randomly Selected Restaurant */}
          {randomlySelectedRestaurant && (
            <>
              {showConfetti && (
                <Confetti width={window.innerWidth} height={document.documentElement.scrollHeight} />
              )}
              <Dialog
                open={true}
                onClose={() => setRandomlySelectedRestaurant(null)}
                PaperProps={{
                  style: {
                    width: '800px', 
                  },
                }}
              >
                <DialogTitle>
                  <Box display="flex" justifyContent="space-between">
                  <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center' }}>
                    🎉 Congrats! We found a place to eat!
                  </Typography>                    
                  <IconButton onClick={() => setRandomlySelectedRestaurant(null)} size="small">
                      <CloseIcon />
                    </IconButton>
                  </Box>
                </DialogTitle>
                <DialogContent>
                  <animated.div style={springProps}>
                  <Box alignItems="center">
                  <Typography variant="h6" >{randomlySelectedRestaurant.name}</Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body1" sx={{fontWeight: 'bold'}}>Restaurant Info</Typography>
                      <Box display="flex" alignItems="center">
                        {renderStars(randomlySelectedRestaurant.rating || 0)}
                        <Typography variant="body1" sx={{ ml: 1 }}>
                          ({randomlySelectedRestaurant.rating || 'N/A'})
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1">
                      {randomlySelectedRestaurant.location.display_address.join(', ')}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Phone: {randomlySelectedRestaurant.display_phone || 'N/A'}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Business Hours:
                    </Typography>
                    <ul>
                      {Object.entries(formatBusinessHours(randomlySelectedRestaurant.business_hours)).map(([day, hours]) => (
                        <li key={day}>
                          <Typography variant="body2">{day}: {hours}</Typography>
                        </li>
                      ))}
                    </ul>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                  {randomlySelectedRestaurant.attributes.menu_url && (
                    <>
                     <Box display="flex" alignItems="center">
                      <Typography variant="h6">Menu </Typography>
                      <Tooltip title="View Menu">
                        <IconButton
                          component="a"
                          href={randomlySelectedRestaurant.attributes.menu_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          color="primary"
                        >
                          <Typography>🍽️</Typography>
                          </IconButton>
                      </Tooltip>
                      </Box>
                    </>
                  )}
                  {randomlySelectedRestaurant.url && (
                    <Box display="flex" alignItems="center">
                     <Typography variant="h6">Yelp</Typography>
                    <Tooltip title="View on Yelp">
                      <IconButton
                        component="a"
                        href={randomlySelectedRestaurant.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                      >
                    <img
                      src="https://s3-media0.fl.yelpcdn.com/assets/public/yelp_favicon.yji-70908133d95b444ea335.svg"
                      alt="Yelp"
                      style={{ width: 24, height: 24 }}
                    />                  
                    </IconButton>
                    </Tooltip>
                    </Box>
                  )}
                </Box>
                  </animated.div>
                </DialogContent>
              </Dialog>
            </>
          )}
          {/* Dialog for Card Clicked Restaurant */}
          {selectedRestaurant && (
            <Dialog
              open={true}
              onClose={() => setSelectedRestaurant(null)}
              PaperProps={{
                style: {
                  width: '800px',
                },
              }}
            >
              <DialogTitle>
                <Box display="flex" justifyContent="space-between">
                <Typography variant="h4">{selectedRestaurant.name}</Typography>
                <IconButton onClick={() => setSelectedRestaurant(null)} size="small">
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                <Typography variant="h6">Restaurant Info</Typography>
                <Box display="flex" alignItems="center">
                    {renderStars(selectedRestaurant.rating || 0)}
                    <Typography variant="body1" sx={{ ml: 1 }}>
                      ({selectedRestaurant.rating || 'N/A'})
                    </Typography>
                  </Box>
                </Box>
                <Typography variant="body1">
                  {selectedRestaurant.location.display_address.join(', ')}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Phone: {selectedRestaurant.display_phone || 'N/A'}
                </Typography>
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Business Hours:
                </Typography>
                <ul>
                  {Object.entries(formatBusinessHours(selectedRestaurant.business_hours)).map(([day, hours]) => (
                    <li key={day}>
                      <Typography variant="body2">{day}: {hours}</Typography>
                    </li>
                  ))}
                </ul>
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
                  {selectedRestaurant.attributes.menu_url && (
                    <>
                      <Box display="flex" alignItems="center">
                        <Typography variant="h6">Menu</Typography>
                        <Tooltip title="View Menu">
                          <IconButton
                            component="a"
                            href={selectedRestaurant.attributes.menu_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            color="primary"
                          >
                          <Typography>🍽️</Typography>
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </>
                  )}

                  {selectedRestaurant.url && (
                   <Box display="flex" alignItems="center">
                     <Typography variant="h6">Yelp</Typography>
                    <Tooltip title="View on Yelp">
                      <IconButton
                        component="a"
                        href={selectedRestaurant.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        color="primary"
                      >
                    <img
                      src="https://s3-media0.fl.yelpcdn.com/assets/public/yelp_favicon.yji-70908133d95b444ea335.svg"
                      alt="Yelp"
                      style={{ width: 24, height: 24 }}
                    />                  
                    </IconButton>
                    </Tooltip>
                    </Box>
                  )}
                </Box>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </Container>
  );
}

export default App;

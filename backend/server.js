require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const bodyParser = require('body-parser');
const environment = process.env.NODE_ENV || 'development';

const app = express();
const PORT = process.env.PORT || 5000;
const YELP_API_KEY = process.env.YELP_API_KEY;

// Middleware
app.use(cors());
app.use(bodyParser.json());

app.post('/api/restaurants', async (req, res) => {
  const { location, categories, radius } = req.body;

  const params = { location, categories, limit: 50,
  };

  if (radius) {
    params.radius = radius; // Include radius only if provided
  }

  try {
    const response = await axios.get('https://api.yelp.com/v3/businesses/search', {
      headers: { Authorization: `Bearer ${YELP_API_KEY}` },
      params,
    });

    res.json({ success: true, data: response.data.businesses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

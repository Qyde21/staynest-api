require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const propertiesRoutes = require('./routes/properties');
const bookingsRoutes = require('./routes/bookings');
const mpesaRoutes = require('./routes/mpesa');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: [
    process.env.CLIENT_URL,
    'http://localhost:3000',
    'https://staynest-3vw3scm9a-kiruiqyde-gmailcoms-projects.vercel.app',
    'https://staynest-indol.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'StayNest API is running', version: '1.0.0' });
});

app.use('/api/auth', authRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/mpesa', mpesaRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log('StayNest API running on port ' + PORT);
});
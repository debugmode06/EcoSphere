require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5001;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 EcoSphere API running on http://localhost:${PORT}`);
  });
});
// Nodemon trigger comment

require('dotenv').config({
  path:'./env'
});
const app = require('./app.js')
const connectDB = require('./db/db');
const PORT = process.env.PORT || 3000;


// Connect to MongoDB
connectDB().then(() => {
  app.on("error", (error)=>{
    console.error("server error",error)
  })
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

}).catch((err) => {
  console.error('Failed to connect to the database !! ', err);
  process.exit(1)
});


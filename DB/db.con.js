import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/JobSearchApp_DB';
mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(()=> console.log("DB Connected!"))
  .catch((err) => console.log(err))
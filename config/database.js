import mongoose from "mongoose";

export const connectDb = () => {
  mongoose.connect(process.env.MONGO_URI, {
    dbName: "EDUNOVA",                    
    useNewUrlParser: true,               
    useUnifiedTopology: true,             
  })
  .then(() => {
    console.log("Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err); 
  });
};

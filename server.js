import app from "./app.js";              
import {connectDb} from './config/database.js';  
import dotenv from 'dotenv';            


dotenv.config({ path: "./config/config.env" });


connectDb(); 


const PORT = process.env.PORT || 6000;   


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

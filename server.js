import app from "./app.js";
import cloudinary from "cloudinary";


cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
app.listen(4000,()=>{
    console.log(`server listing at port ${4000}`);
});
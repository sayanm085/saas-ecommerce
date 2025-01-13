import connectDB from "./db/Database.js";
import app from "./app.js";
import dotenv from 'dotenv';


dotenv.config();



connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is running on port http://localhost:${process.env.PORT} ||8000`);
    });
})
.catch((error) => {
    console.log("error in db connection" , error);
    process.exit(1);
});
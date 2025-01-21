import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';


// Create the Express app
let app = express();

app.use(cors({
    origin: 'http://localhost:5173',  // Allow all origins
    credentials: true,  // Allow cookies to be sent with requests
    allowedHeaders: ['Content-Type', 'Authorization '], // Allow the Authorization header to be sent
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', ] // Allow the GET, POST, PUT, DELETE methods
}));

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

app.get('/', (req, res) => {

res.json({message: "Welcome to the API"});

});

// POST route to set the cookie
app.post('/api/set-cookie', (req, res) => {
    res.cookie('myCookie', 'Hello', {
        httpOnly: true,   // Cookie can't be accessed via JavaScript
        secure: true,     // Cookie is only sent over HTTPS
        sameSite: 'None', // Allows cross-origin cookies (necessary in this case)
        maxAge: 1000 * 60 * 60 * 24 * 7  // Cookie expiration time (1 week)
    });
    res.send('Cookie set successfully');
});
// GET route to get the cookie
app.get("/api/get-cookie", (req, res) => {
    const myCookie = req.cookies?.myCookie;
    res.json({ cookieValue: myCookie });
});


//Routes Import
import userRoutes from './routes/user.routes.js';
import WebContent from './routes/webContent.routes.js';
import product  from './routes/Product.routes.js';
import orders from './routes/order.routes.js';
import discountcoupon from './routes/DiscountCoupon.routes.js';
import Contact from './routes/Contact.routes.js';
import admin from './routes/admin.routes.js';


//Routes Definition
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/content', WebContent);
app.use('/api/v1/products', product);
app.use('/api/v1/orders', orders);
app.use('/api/v1/discountcoupon', discountcoupon);
app.use('/api/v1/contact', Contact);

//Admin Routes
app.use('/api/v1/admin', admin);


export default app;
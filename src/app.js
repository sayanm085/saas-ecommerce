import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import crypto from 'crypto';


let a= async () => {
  let data = await fetch('https://api.github.com/users/defunkt',{
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  }
  )
}

// Create the Express app
let app = express();

app.use(cors({
    origin: true , // Allow all origins
    credentials: true, // Allow cookies to be sent
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


//Routes Import
import userRoutes from './routes/user.routes.js';
import WebContent from './routes/webContent.routes.js';
import product  from './routes/Product.routes.js';
import orders from './routes/order.routes.js';
import discountcoupon from './routes/DiscountCoupon.routes.js';
import Contact from './routes/Contact.routes.js';


//Routes Definition
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/content', WebContent);
app.use('/api/v1/products', product);
app.use('/api/v1/orders', orders);
app.use('/api/v1/discountcoupon', discountcoupon);
app.use('/api/v1/contact', Contact);


export default app;
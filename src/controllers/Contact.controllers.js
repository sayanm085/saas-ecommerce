import Contact from '../models/Contact.model.js';
import {asyncHandler} from '../utils/asyncHandler.js';
import {ApiResponse} from '../utils/ApiResponse.js';
import mailsend from "../utils/nodemailer.utils.js";


const createContactUs = asyncHandler(async (req, res) => {
    const { name, email, phone, message } = req.body;
  
    // Precompute the unique contact number to avoid modifying the document after creation
    const contactUniqueNumber = "HELP" + Math.floor(100000 + Math.random() * 900000).toString() ;
  
    // Create and save the contact in a single step
    const contact = await Contact.create({
      name,
      email,
      phone,
      message,
      contactuniquenumber: contactUniqueNumber, // Set during creation
    });
  
    // Respond immediately after contact creation
    res.status(201).json(new ApiResponse(201, contactUniqueNumber, 'Message sent successfully'));

    // mail send to user for Contact-Us confirmation and message details

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Confirmation</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 50px auto;
            background: #fff;
            padding: 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            border-radius: 8px;
        }
        h1 {
            color: #007BFF;
            text-align: center;
        }
        p {
            margin: 10px 0;
        }
        .details {
            background: #f0f8ff;
            padding: 15px;
            border-left: 4px solid #007BFF;
            border-radius: 5px;
        }
        .details p {
            margin: 5px 0;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #555;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, ${name}</h1>
        <p>Thank you for contacting us. We have received your message and will get back to you soon.</p>
        <p>Here are the details of your message:</p>

        <div class="details">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong> ${message}</p>
            <p><strong>Your unique contact number is:</strong> ${contactUniqueNumber}</p>
        </div>

        <div class="footer">
            Regards,<br>
            <strong>Shotlin Team</strong>
        </div>
    </div>
</body>
</html>
`;

    await mailsend(email, "Contact Us Message Confirmation", html);

    // mail send to admin for Contact-Us message details


    
  });

  export {createContactUs};
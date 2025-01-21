// This file contains the email template for sending OTP to the user for email verification.
const OTPtemplate = (otp) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f4f4f4;
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
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header h1 {
            color: #4CAF50;
            font-size: 26px;
        }
        .content {
            font-size: 16px;
            color: #555;
            text-align: center;
        }
        .otp-box {
            margin: 20px 0;
            padding: 15px;
            background: #fef6e4;
            border: 2px solid #FF9800;
            border-radius: 8px;
            display: inline-block;
            font-size: 28px;
            font-weight: bold;
            color: #FF5722;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 14px;
            color: #777;
        }
        .footer a {
            color: #4CAF50;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Platform!</h1>
        </div>
        <div class="content">
            <p>Thank you for joining us! Please use the OTP below to verify your email address:</p>
            <div class="otp-box">${otp}</div>
            <p>This OTP is valid for the next 10 minutes.</p>
            <p>If you did not request this email, please ignore it.</p>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
        <div class="footer">
            Need help? Contact our support team at 
            <a href="mailto:support@shotlin.com">support@shotlin.com</a>.
            <br>&copy; ${new Date().getFullYear()} Our Platform. All rights reserved.
        </div>
    </div>
</body>
</html>
  `;
};

const welcomeTemplate = (fullName) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Platform</title>
    <style>
        /* General Styles */
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f7fa;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 650px;
            margin: 0 auto;
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }

        /* Header */
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .header img {
            width: 120px;
            height: auto;
        }
        .header h1 {
            font-size: 28px;
            color: #333;
        }

        /* Welcome Message */
        .welcome-message {
            font-size: 18px;
            color: #333;
            line-height: 1.6;
            text-align: center;
            margin-bottom: 25px;
        }

        .welcome-message strong {
            color: #007bff;
        }

        /* Button */
        .btn {
            display: inline-block;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            padding: 12px 30px;
            font-size: 16px;
            border-radius: 8px;
            margin: 10px 0;
            text-align: center;
            box-shadow: 0 4px 8px rgba(0, 123, 255, 0.2);
            transition: background-color 0.3s;
        }
        .btn:hover {
            background-color: #0056b3;
        }

        /* Centering Button */
        .button-container {
            text-align: center;
        }

        /* Footer */
        .footer {
            text-align: center;
            font-size: 14px;
            color: #888;
            margin-top: 30px;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }

        /* Responsive Design */
        @media (max-width: 600px) {
            .email-container {
                padding: 15px;
            }
            .header h1 {
                font-size: 24px;
            }
            .welcome-message {
                font-size: 16px;
            }
            .btn {
                font-size: 14px;
                padding: 10px 25px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <img src="https://your-logo-url.com/logo.png" alt="Logo">
            <h1>Welcome to Our Platform, ${fullName}!</h1>
        </div>

        <div class="welcome-message">
            <p>We are excited to have you on board. Your account has been created successfully, and you're all set to explore the amazing features our platform offers.</p>
        </div>

        <!-- Centering the button -->
        <div class="button-container">
            <a href="https://your-platform.com/dashboard" class="btn">Go to Dashboard</a>
        </div>

        <div class="footer">
            <p>If you have any questions, feel free to <a href="mailto:support@your-platform.com">contact us</a>.</p>
            <p>&copy; 2025 Your Platform. All rights reserved.</p>
        </div>
    </div>
</body>
</html>

`;
};

export { OTPtemplate, welcomeTemplate };

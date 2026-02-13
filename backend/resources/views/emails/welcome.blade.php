<!DOCTYPE html>
<html>
<head>
    <title>Welcome to Zidaan Architectures</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Welcome, {{ $user->name }}!</h2>
        
        <p>Thank you for joining Zidaan Architectures. We're excited to help you find your dream property.</p>
        
        <p>You can now browse our exclusive listings, save your favorite properties, and schedule viewings with our top agents.</p>
        
        <div style="margin: 30px 0;">
            <a href="{{ config('app.frontend_url') }}/login" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Login to your account</a>
        </div>
        
        <p>If you have any questions, feel free to reply to this email.</p>
        
        <p>Best regards,<br>The Zidaan Architectures Team</p>
    </div>
</body>
</html>

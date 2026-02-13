<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; }
        .container { padding: 20px; }
        .btn { display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Booking Confirmation</h2>
        <p>Dear {{ $booking->user->name }},</p>
        <p>Your booking for <strong>{{ $booking->property->title }}</strong> has been confirmed.</p>
        
        <p><strong>Date:</strong> {{ $booking->booking_date }}</p>
        <p><strong>Time:</strong> {{ $booking->booking_time }}</p>
        
        <p>We look forward to seeing you there!</p>
        
        <p>Best regards,<br>Real Estate Team</p>
    </div>
</body>
</html>

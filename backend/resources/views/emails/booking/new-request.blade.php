<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; }
        .container { padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>New Booking Request</h2>
        <p>Hello {{ $booking->property->agent->name }},</p>
        <p>You have a new booking request for <strong>{{ $booking->property->title }}</strong>.</p>
        
        <p><strong>Client:</strong> {{ $booking->user->name }}</p>
        <p><strong>Date:</strong> {{ $booking->booking_date }}</p>
        <p><strong>Time:</strong> {{ $booking->booking_time }}</p>
        <p><strong>Message:</strong> {{ $booking->message }}</p>
        
        <p>Please log in to your dashboard to approve or reject this request.</p>
    </div>
</body>
</html>

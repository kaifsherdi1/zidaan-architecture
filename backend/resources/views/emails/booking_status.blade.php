<!DOCTYPE html>
<html>
<head>
    <title>Viewing Request Update</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">Viewing Request Update</h2>
        
        <p>Hello {{ $booking->user->name }},</p>
        
        <p>Your viewing request for <strong>{{ $booking->property->title }}</strong> has been updated.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Status:</strong> <span style="text-transform: capitalize; color: {{ $booking->status == 'confirmed' ? 'green' : ($booking->status == 'cancelled' ? 'red' : 'orange') }};">{{ $booking->status }}</span></p>
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y') }}</p>
            <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</p>
            
            @if($booking->notes)
            <p><strong>Agent Notes:</strong> {{ $booking->notes }}</p>
            @endif
        </div>
        
        <p>Please check your dashboard for more details.</p>
        
        <p>Best regards,<br>The Zidaan Architectures Team</p>
    </div>
</body>
</html>

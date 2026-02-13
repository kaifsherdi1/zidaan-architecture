<!DOCTYPE html>
<html>
<head>
    <title>New Viewing Request</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
    <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #2c3e50;">New Viewing Request</h2>
        
        <p>Hello Agent {{ $booking->agent->user->name ?? '' }},</p>
        
        <p>You have received a new viewing request.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Property:</strong> {{ $booking->property->title }}</p>
            <p><strong>Client:</strong> {{ $booking->user->name }} ({{ $booking->user->email }})</p>
            <p><strong>Date:</strong> {{ \Carbon\Carbon::parse($booking->booking_date)->format('M d, Y') }}</p>
            <p><strong>Time:</strong> {{ \Carbon\Carbon::parse($booking->booking_time)->format('h:i A') }}</p>
            
            @if($booking->message)
            <p><strong>Message:</strong> {{ $booking->message }}</p>
            @endif
        </div>
        
        <div style="margin: 30px 0;">
            <a href="{{ config('app.frontend_url') }}/agent/dashboard" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Request</a>
        </div>
        
        <p>Best regards,<br>The Zidaan Architectures Team</p>
    </div>
</body>
</html>

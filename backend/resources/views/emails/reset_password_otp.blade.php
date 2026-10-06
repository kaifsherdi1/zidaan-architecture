@include('emails.notice', [
    'heading' => 'Your password reset code',
    'lines' => [
        'Use this code to reset your password: ' . $otp,
        'The code expires in 10 minutes and can only be used once.',
        'If you did not ask to reset your password, you can ignore this email — your password has not changed.',
    ],
    'actionUrl' => null,
    'actionText' => null,
])

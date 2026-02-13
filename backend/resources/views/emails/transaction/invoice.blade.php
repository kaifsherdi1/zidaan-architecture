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
        <h2>Transaction Invoice</h2>
        <p>Dear Customer,</p>
        <p>Please find attached the invoice for your recent transaction regarding <strong>{{ $transaction->property->title }}</strong>.</p>
        
        <p><strong>Transaction ID:</strong> #{{ $transaction->id }}</p>
        <p><strong>Amount:</strong> ${{ number_format($transaction->actual_price, 2) }}</p>
        
        <p>Thank you for your business!</p>
    </div>
</body>
</html>

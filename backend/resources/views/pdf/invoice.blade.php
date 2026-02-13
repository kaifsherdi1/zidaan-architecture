<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Transaction Invoice</title>
    <style>
        body { font-family: sans-serif; }
        .header { text-align: center; margin-bottom: 30px; }
        .invoice-details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Transaction Invoice</h1>
        <p>Real Estate Platform</p>
    </div>

    <div class="invoice-details">
        <p><strong>Transaction ID:</strong> #{{ $transaction->id }}</p>
        <p><strong>Date:</strong> {{ $transaction->created_at->format('d M Y') }}</p>
        <p><strong>Property:</strong> {{ $transaction->property->title }}</p>
        <p><strong>Agent:</strong> {{ $transaction->agent->name }}</p>
        <p><strong>Client:</strong> {{ $transaction->client_name }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Description</th>
                <th>Amount</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Property Sale/Rent Transaction</td>
                <td>${{ number_format($transaction->actual_price, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="total">
        <p>Total Amount: ${{ number_format($transaction->actual_price, 2) }}</p>
    </div>

    <p>Thank you for your business!</p>
</body>
</html>

<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice #{{ $transaction->id }}</title>
    <style>
        body { font-family: sans-serif; color: #222; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { margin: 0; letter-spacing: 2px; text-transform: uppercase; }
        .header p { color: #777; margin: 4px 0 0; }
        .invoice-details { margin-bottom: 20px; }
        .invoice-details p { margin: 4px 0; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .total { text-align: right; font-weight: bold; font-size: 16px; }
        .status { text-transform: uppercase; font-size: 11px; letter-spacing: 1px; color: #777; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Zidaan Architectures</h1>
        <p>Transaction Invoice</p>
    </div>

    <div class="invoice-details">
        <p><strong>Invoice #:</strong> {{ $transaction->id }}</p>
        <p><strong>Date:</strong> {{ optional($transaction->transaction_date)->format('d M Y') ?? $transaction->created_at->format('d M Y') }}</p>
        <p><strong>Property:</strong> {{ optional($transaction->property)->title ?? 'N/A' }}</p>
        <p><strong>Agent:</strong> {{ optional($transaction->agent)->name ?? 'N/A' }}</p>
        <p><strong>Client:</strong> {{ $transaction->client_name }}</p>
        <p class="status"><strong>Status:</strong> {{ $transaction->status }}</p>
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
                <td>{{ optional($transaction->property)->title ?? 'Property transaction' }}</td>
                <td>&#8377;{{ number_format((float) $transaction->amount, 2) }}</td>
            </tr>
        </tbody>
    </table>

    <div class="total">
        <p>Total: &#8377;{{ number_format((float) $transaction->amount, 2) }}</p>
    </div>

    <p>Thank you for your business.</p>
</body>
</html>

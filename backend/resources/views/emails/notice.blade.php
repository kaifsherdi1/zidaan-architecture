<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $heading }}</title>
</head>
<body style="margin:0;padding:0;background:#f4f2ee;font-family:Helvetica,Arial,sans-serif;color:#111;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f2ee;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e1d8;">
                    <tr>
                        <td style="padding:28px 32px;border-bottom:1px solid #e5e1d8;font-size:12px;letter-spacing:3px;text-transform:uppercase;">
                            {{ config('app.name') }}
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:32px;">
                            <h1 style="margin:0 0 20px;font-size:20px;font-weight:600;">{{ $heading }}</h1>
                            @foreach ($lines as $line)
                                <p style="margin:0 0 14px;font-size:15px;line-height:1.6;color:#333;">{{ $line }}</p>
                            @endforeach
                            @if ($actionUrl)
                                <p style="margin:28px 0 0;">
                                    <a href="{{ $actionUrl }}" style="display:inline-block;background:#111;color:#fff;text-decoration:none;padding:12px 22px;font-size:13px;letter-spacing:1px;text-transform:uppercase;">{{ $actionText }}</a>
                                </p>
                            @endif
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:20px 32px;border-top:1px solid #e5e1d8;font-size:12px;color:#888;">
                            You are receiving this because you have an account with {{ config('app.name') }}.
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>

<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>Laravel</title>

    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=figtree:400,600&display=swap" rel="stylesheet"/>
    <link href="https://unpkg.com/tailwindcss@^1.0/dist/tailwind.min.css" rel="stylesheet">
    <!-- Styles -->
    <style>
        /* ! tailwindcss v3.4.1 | MIT License | https://tailwindcss.com */
    </style>
</head>
<body style="font-family: 'Figtree', sans-serif;">
<div
    style="max-width: 640px; margin: 0 auto; padding: 16px; display: flex; justify-content: center; align-items: center; min-height: 100vh;">
    <div>

        <img src="https://novaedu.vn/frontend/asset/images/logo_ver_new.png" alt="Logo"
             style="width: 100%; height: 128px; margin: 0 auto 16px;">
        <h2 style="margin-bottom: 16px; text-align: center; font-size: 1.125rem; text-transform: uppercase; font-weight: 500;">
            Thay đổi mật khẩu
        </h2>
        <div style="margin-bottom: 16px;">
            <strong>Mật khẩu mới của bạn là: {{$inviteData['password']}}</strong>
        </div>

        <a href="{{ $inviteData['link'] }}"
           style="display: inline-block; padding: 8px 16px; background-color: #38a169; color: white; border-radius: 4px; text-decoration: none; transition: background-color 0.3s;">
            TRUY CẬP NGAY
        </a>
    </div>
</div>
</body>
</html>

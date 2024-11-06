self.addEventListener('push', event => {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/logo.jpg', // Đường dẫn đến icon của thông báo
        data: {
            url: data.data.url // URL chứa trong payload để mở khi nhấn
        }
    };
    self.registration.showNotification(data.title, options);
});

self.addEventListener('notificationclick', event => {
    event.notification.close(); // Đóng thông báo sau khi nhấp vào

    // Mở URL từ dữ liệu đính kèm của thông báo
    event.waitUntil(
        clients.matchAll({type: 'all', includeUncontrolled: true})
            .then(clientList => {
                // Kiểm tra xem có cửa sổ nào đang mở không
                for (let i = 0; i < clientList.length; i++) {
                    let client = clientList[i];
                    if (client.url === event.notification.data.url && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Nếu không có cửa sổ nào mở, mở một cửa sổ mới với URL
                if (clients.openWindow) {
                    return clients.openWindow(event.notification.data.url);
                }
            })
    );
});

// Cài đặt service worker


// Background Service Worker for Web Push Notifications

self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            
            const options = {
                body: data.body,
                icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
                vibrate: [200, 100, 200],
                badge: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
                data: {
                    url: 'https://zest-kohl-xi.vercel.app/home' // Modify if specific routing is desired
                }
            };

            event.waitUntil(
                self.registration.showNotification(data.title || "Zest Platform", options)
            );
        } catch (err) {
            console.error('[SW] Error parsing push data', err);
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    if (event.notification.data && event.notification.data.url) {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});

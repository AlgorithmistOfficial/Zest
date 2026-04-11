// Background Service Worker for Web Push Notifications

// Force activation immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener('push', function(event) {
    console.log('[SW] Push received.');
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
        } catch (err) {
            console.warn('[SW] Push data not JSON, using text:', err);
            data = { title: "Zest Platform", body: event.data.text() };
        }
    }

    const title = data.title || "Zest Platform";
    const options = {
        body: data.body || "You have a new update from Zest.",
        icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
        vibrate: [200, 100, 200],
        badge: 'https://cdn-icons-png.flaticon.com/512/2103/2103633.png',
        tag: 'exam-reminder',
        renotify: true,
        data: {
            url: data.url || 'https://zest-kohl-xi.vercel.app/home'
        }
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    const clickUrl = event.notification.data.url;
    
    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(clientList) {
            for (let i = 0; i < clientList.length; i++) {
                let client = clientList[i];
                if (client.url === clickUrl && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow(clickUrl);
            }
        })
    );
});

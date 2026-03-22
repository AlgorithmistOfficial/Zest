/* eslint-disable no-restricted-globals */
self.addEventListener('push', (event) => {
    let data = { title: 'Test Alert', body: 'You have an upcoming test!', url: '/' };
    try {
        data = event.data.json();
    } catch (e) {
        console.log('[Service Worker] Push data was not JSON:', event.data.text());
        // If not JSON, use text as body
        data.body = event.data.text() || data.body;
    }

    const options = {
        body: data.body,
        icon: '/logo.png',
        badge: '/logo.png',
        data: data.url || '/',
        vibrate: [100, 50, 100],
        actions: [
            { action: 'open', title: 'Open Zest' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        // eslint-disable-next-line no-undef
        clients.openWindow(event.notification.data || '/')
    );
});

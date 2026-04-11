// Background Service Worker for Web Push Notifications

// Force activation immediately
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim());
});

// Listener for local tests from the React app
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'TEST_NOTIFICATION') {
        self.registration.showNotification("Zest: Local Connection OK", {
            body: "The React app successfully talked to the Service Worker!",
            tag: 'test'
        });
    }
});

self.addEventListener('push', function(event) {
    console.log('[SW] Push received.');
    
    let data = {};
    if (event.data) {
        try {
            data = event.data.json();
            console.log('[SW] Payload found (JSON):', data);
        } catch (err) {
            console.warn('[SW] Payload found (Text):', event.data.text());
            data = { title: "Zest Platform", body: event.data.text() };
        }
    } else {
        console.warn('[SW] No data found in push event.');
    }

    // STRIPPED DOWN FOR DEBUGGING
    const title = data.title || "Zest Platform";
    const options = {
        body: data.body || "Update from Zest.",
        tag: 'exam-reminder',
        renotify: true,
        // REMOVED ICONS AND BADGES TO PREVENT LOAD FAILURES
        data: {
            url: data.url || 'https://zest-kohl-xi.vercel.app/home'
        }
    };

    console.log(`[SW] Attempting to showNotification: "${title}"`);

    event.waitUntil(
        self.registration.showNotification(title, options)
            .then(() => console.log('[SW] SUCCESS: showNotification completed.'))
            .catch(err => console.error('[SW] ERROR: showNotification failed:', err))
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

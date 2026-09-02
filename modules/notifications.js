let notifyPermissionAsked = false;

export function ensureNotifyPermission() {
  if (notifyPermissionAsked) return;
  notifyPermissionAsked = true;
  try {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission().catch(function(){});
    }
  } catch(e){}
}

export function notify(title, body) {
  try {
    if (window.Notification && Notification.permission === 'granted') {
      new Notification(title, { body: body, silent: true });
    }
  } catch(e){}
}

export function initNotifications() {
  // Initialized on demand
}

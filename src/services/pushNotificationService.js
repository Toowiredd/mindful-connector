import { toast } from 'sonner';

class PushNotificationService {
  constructor() {
    this.permission = null;
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support desktop notification');
      return;
    }

    this.permission = await Notification.requestPermission();
    return this.permission;
  }

  async sendNotification(title, options = {}) {
    if (this.permission !== 'granted') {
      await this.requestPermission();
    }

    if (this.permission === 'granted') {
      const notification = new Notification(title, options);
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } else {
      toast(title, {
        description: options.body,
        duration: 5000,
      });
    }
  }

  async scheduleNotification(title, options = {}, delay) {
    setTimeout(() => this.sendNotification(title, options), delay);
  }
}

export const pushNotificationService = new PushNotificationService();
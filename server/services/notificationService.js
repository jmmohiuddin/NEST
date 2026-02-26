const Notification = require('../models/Notification');

class NotificationService {
  static async create({ recipient, sender, type, title, message, data, link }) {
    try {
      const notification = await Notification.create({
        recipient,
        sender,
        type,
        title,
        message,
        data,
        link,
      });
      return notification;
    } catch (error) {
      console.error('Failed to create notification:', error.message);
      return null;
    }
  }

  static async createBulk(notifications) {
    try {
      return await Notification.insertMany(notifications);
    } catch (error) {
      console.error('Failed to create bulk notifications:', error.message);
      return [];
    }
  }

  static async getUnreadCount(userId) {
    return await Notification.countDocuments({ recipient: userId, isRead: false });
  }
}

module.exports = NotificationService;

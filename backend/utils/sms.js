const twilio = require('twilio');
const ErrorResponse = require('./errorResponse');

class SMS {
  constructor() {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    this.from = process.env.TWILIO_PHONE_NUMBER;
  }

  async send(to, message) {
    try {
      if (!to || !message) {
        throw new Error('Recipient number and message are required');
      }

      // Format phone number if needed
      const formattedTo = to.startsWith('+') ? to : `+${to}`;
      
      const response = await this.client.messages.create({
        body: message,
        from: this.from,
        to: formattedTo
      });

      return {
        success: true,
        messageSid: response.sid,
        status: response.status
      };
    } catch (error) {
      console.error('SMS sending error:', error);
      throw new ErrorResponse('Failed to send SMS', 500);
    }
  }

  async sendOTP(to) {
    try {
      // Generate a 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000);
      const message = `Your OTP for Tuition Management System is: ${otp}. Valid for 10 minutes.`;
      
      await this.send(to, message);
      
      return {
        success: true,
        otp: otp.toString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
      };
    } catch (error) {
      console.error('OTP sending error:', error);
      throw new ErrorResponse('Failed to send OTP', 500);
    }
  }

  async sendPaymentConfirmation(to, amount, transactionId) {
    try {
      const message = `Thank you for your payment of ₹${amount}. Transaction ID: ${transactionId}. This is a confirmation of your recent payment to Tuition Management System.`;
      
      const result = await this.send(to, message);
      
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('Payment confirmation SMS error:', error);
      // Don't throw error as payment is already processed
      return {
        success: false,
        error: 'Failed to send payment confirmation SMS'
      };
    }
  }

  async sendAttendanceNotification(to, studentName, status, date) {
    try {
      const formattedDate = new Date(date).toLocaleDateString('en-IN');
      const message = `Attendance marked for ${studentName}: ${status} on ${formattedDate}. - Tuition Management System`;
      
      const result = await this.send(to, message);
      
      return {
        success: true,
        ...result
      };
    } catch (error) {
      console.error('Attendance notification SMS error:', error);
      // Don't throw error as attendance is already marked
      return {
        success: false,
        error: 'Failed to send attendance notification'
      };
    }
  }
}

module.exports = new SMS();

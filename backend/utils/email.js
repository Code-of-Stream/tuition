const nodemailer = require('nodemailer');
const pug = require('pug');
const { convert } = require('html-to-text');
const ErrorResponse = require('./errorResponse');

class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name ? user.name.split(' ')[0] : 'User';
    this.url = url;
    this.from = `Tuition Management <${process.env.EMAIL_FROM || 'noreply@tuitionmanagement.com'}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Use SendGrid or other production email service
      return nodemailer.createTransport({
        service: 'SendGrid', // or your preferred service
        auth: {
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
    }

    // Use Mailtrap for development
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
      port: process.env.EMAIL_PORT || 2525,
      auth: {
        user: process.env.EMAIL_USERNAME || 'your_mailtrap_user',
        pass: process.env.EMAIL_PASSWORD || 'your_mailtrap_pass'
      }
    });
  }

  // Send the actual email
  async send(template, subject) {
    try {
      // 1) Render HTML based on a pug template
      const html = pug.renderFile(
        `${__dirname}/../views/email/${template}.pug`,
        {
          firstName: this.firstName,
          url: this.url,
          subject
        }
      );

      // 2) Define email options
      const mailOptions = {
        from: this.from,
        to: this.to,
        subject,
        html,
        text: convert(html, { wordwrap: 130 })
      };

      // 3) Create a transport and send email
      await this.createTransport().sendMail(mailOptions);
    } catch (err) {
      console.error('Error sending email:', err);
      throw new Error('There was an error sending the email. Please try again later.');
    }
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to Tuition Management System!');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes)'
    );
  }

  async sendPaymentReceipt(paymentDetails) {
    try {
      const html = pug.renderFile(
        `${__dirname}/../views/email/paymentReceipt.pug`,
        {
          firstName: this.firstName,
          amount: paymentDetails.amount,
          date: new Date(paymentDetails.date).toLocaleDateString(),
          transactionId: paymentDetails.transactionId,
          paymentMethod: paymentDetails.paymentMethod,
          batchName: paymentDetails.batchName
        }
      );

      const mailOptions = {
        from: this.from,
        to: this.to,
        subject: 'Payment Receipt',
        html,
        text: convert(html, { wordwrap: 130 })
      };

      await this.createTransport().sendMail(mailOptions);
    } catch (err) {
      console.error('Error sending payment receipt:', err);
      // Don't throw error as payment is already processed
    }
  }

  static async sendEmail(options) {
    try {
      // Create a nodemailer transport
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_EMAIL,
          pass: process.env.SMTP_PASSWORD
        }
      });

      // Send email
      await transporter.sendMail({
        from: `Tuition Management <${process.env.SMTP_EMAIL}>`,
        to: options.email,
        subject: options.subject,
        text: options.message
      });
    } catch (err) {
      console.error('Email could not be sent:', err);
      throw new Error('Email could not be sent');
    }
  }
}

module.exports = Email;

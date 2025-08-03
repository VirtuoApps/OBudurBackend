import * as nodemailer from 'nodemailer';

import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { MailtrapClient } from 'mailtrap';

export interface MailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[];
  bcc?: string | string[];
  attachments?: Array<{
    filename: string;
    content: Buffer | string;
    contentType?: string;
  }>;
}

export interface MailtrapTemplateOptions {
  to: string | string[];
  templateUuid: string;
  templateVariables?: Record<string, any>;
  subject?: string; // Optional, will use default if not provided
  from?: {
    email: string;
    name: string;
  };
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: nodemailer.Transporter;
  private readonly mailtrapClient: MailtrapClient;

  constructor(
    private readonly mailerService: MailerService,
    private readonly configService: ConfigService,
  ) {
    // Create traditional SMTP transporter for Mailtrap
    this.transporter = nodemailer.createTransport({
      host: this.configService.get('MAIL_HOST', 'sandbox.smtp.mailtrap.io'),
      port: parseInt(this.configService.get('MAIL_PORT', '2525')),
      secure: false, // Mailtrap uses TLS
      auth: {
        user: this.configService.get('MAIL_USER'),
        pass: this.configService.get('MAIL_PASS'),
      },
      pool: true, // Enable connection pooling
      maxConnections: 5,
      maxMessages: 100,
    });

    // Create Mailtrap Client for template emails
    const mailtrapToken = this.configService.get('MAILTRAP_TOKEN');
    if (mailtrapToken) {
      this.mailtrapClient = new MailtrapClient({
        token: mailtrapToken,
      });
    }
  }

  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.logger.log('Mail transporter connection verified successfully');
    } catch (error) {
      this.logger.error('Failed to verify mail transporter connection', error);
    }
  }

  /**
   * Send mail using Nodemailer directly (recommended for better control)
   */
  async sendMail(mailOptions: MailOptions): Promise<void> {
    try {
      const from =
        mailOptions.from || this.configService.get('MAIL_FROM', 'Obudur');

      const info = await this.transporter.sendMail({
        from,
        to: Array.isArray(mailOptions.to)
          ? mailOptions.to.join(', ')
          : mailOptions.to,
        cc: Array.isArray(mailOptions.cc)
          ? mailOptions.cc.join(', ')
          : mailOptions.cc,
        bcc: Array.isArray(mailOptions.bcc)
          ? mailOptions.bcc.join(', ')
          : mailOptions.bcc,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
        attachments: mailOptions.attachments,
      });

      this.logger.log(
        `Email sent successfully to ${mailOptions.to}. Message ID: ${info.messageId}`,
      );
    } catch (error) {
      this.logger.error(`Failed to send email to ${mailOptions.to}`, error);
      throw new Error(`Mail sending failed: ${error.message}`);
    }
  }

  /**
   * Send mail using NestJS Mailer (fallback method)
   */
  async sendMailWithMailer(mailOptions: MailOptions): Promise<void> {
    try {
      await this.mailerService.sendMail({
        to: mailOptions.to,
        cc: mailOptions.cc,
        bcc: mailOptions.bcc,
        subject: mailOptions.subject,
        text: mailOptions.text,
        html: mailOptions.html,
        attachments: mailOptions.attachments,
      });

      this.logger.log(
        `Email sent successfully via MailerService to ${mailOptions.to}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send email via MailerService to ${mailOptions.to}`,
        error,
      );
      throw new Error(`Mail sending failed: ${error.message}`);
    }
  }

  async sendVerifyCode(verifyCode: string, email: string): Promise<void> {
    const subject = 'Obudur Doğrulama Linkiniz';
    const html = this.generateVerifyEmailTemplate(verifyCode);

    await this.sendMail({
      to: email,
      subject,
      html,
    });
  }

  async sendForgotPasswordMail(
    forgotPasswordCode: string,
    email: string,
  ): Promise<void> {
    const subject = 'Obudur Şifrenizi Yenilemek İçin Kodunuz';
    const html = this.generateForgotPasswordTemplate(forgotPasswordCode);

    await this.sendMail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send welcome email to new users
   */
  async sendWelcomeEmail(email: string, name?: string): Promise<void> {
    const subject = "Obudur'a Hoş Geldiniz!";
    const html = this.generateWelcomeTemplate(name);

    await this.sendMail({
      to: email,
      subject,
      html,
    });
  }

  /**
   * Send notification email
   */
  async sendNotificationEmail(
    email: string | string[],
    subject: string,
    message: string,
    isHtml = false,
  ): Promise<void> {
    const mailOptions: MailOptions = {
      to: email,
      subject,
    };

    if (isHtml) {
      mailOptions.html = this.generateNotificationTemplate(subject, message);
    } else {
      mailOptions.text = message;
    }

    await this.sendMail(mailOptions);
  }

  /**
   * Send bulk emails
   */
  async sendBulkEmails(
    emails: string[],
    subject: string,
    html: string,
    batchSize = 10,
  ): Promise<void> {
    const batches = this.chunkArray(emails, batchSize);

    for (const batch of batches) {
      const promises = batch.map((email) =>
        this.sendMail({
          to: email,
          subject,
          html,
        }).catch((error) => {
          this.logger.error(`Failed to send bulk email to ${email}`, error);
          return null;
        }),
      );

      await Promise.all(promises);

      // Add delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(1000); // 1 second delay
      }
    }
  }

  /**
   * Send mail using Mailtrap API with templates (recommended for production)
   */
  async sendMailWithTemplate(
    templateOptions: MailtrapTemplateOptions,
  ): Promise<void> {
    if (!this.mailtrapClient) {
      throw new Error(
        'Mailtrap API token not configured. Cannot use template method.',
      );
    }

    try {
      const sender = templateOptions.from || {
        email: this.configService.get(
          'MAIL_FROM_ADDRESS',
          'hello@obudur.com',
        ),
        name: this.configService.get('MAIL_FROM_NAME', 'Obudur'),
      };

      const recipients = Array.isArray(templateOptions.to)
        ? templateOptions.to.map(email => ({ email }))
        : [{ email: templateOptions.to }];

      await this.mailtrapClient.send({
        from: sender,
        to: recipients,
        template_uuid: templateOptions.templateUuid,
        template_variables: templateOptions.templateVariables || {},
      });

      this.logger.log(
        `Template email sent successfully to ${templateOptions.to}. Template: ${templateOptions.templateUuid}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send template email to ${templateOptions.to}`,
        error,
      );
      throw new Error(`Template mail sending failed: ${error.message}`);
    }
  }

  /**
   * Send verification email using Mailtrap template
   */
  async sendVerifyCodeWithTemplate(
    verifyCode: string,
    email: string,
    userName?: string,
  ): Promise<void> {
    const templateUuid = this.configService.get('MAILTRAP_VERIFY_TEMPLATE');

    if (!templateUuid) {
      // Fallback to custom HTML template
      return this.sendVerifyCode(verifyCode, email);
    }

    await this.sendMailWithTemplate({
      to: email,
      templateUuid,
      subject: 'Obudur Doğrulama Linkiniz',
      templateVariables: {
        user_name: userName || 'Kullanıcı',
        verification_link: `https://obudur.com/verify-link/${verifyCode}`,
        verification_code: verifyCode,
        today_date: new Date().toLocaleDateString('tr-TR', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }),
      },
    });
  }

  /**
   * Send password reset email using Mailtrap template
   */
  async sendForgotPasswordWithTemplate(
    resetCode: string,
    email: string,
    userName?: string,
  ): Promise<void> {
    const templateUuid = this.configService.get('MAILTRAP_RESET_TEMPLATE');

    if (!templateUuid) {
      // Fallback to custom HTML template
      return this.sendForgotPasswordMail(resetCode, email);
    }

    await this.sendMailWithTemplate({
      to: email,
      templateUuid,
      subject: 'Obudur Şifre Sıfırlama Kodunuz',
      templateVariables: {
        user_name: userName || 'Kullanıcı',
        reset_code: resetCode,
        reset_link: `https://obudur.com/sifre-sifirlama/${resetCode}`,
      },
    });
  }

  /**
   * Send welcome email using Mailtrap template
   */
  async sendWelcomeEmailWithTemplate(
    email: string,
    userName: string,
    onboardingLinks?: {
      getStartedLink?: string;
      onboardingVideoLink?: string;
      nextStepLink?: string;
    },
  ): Promise<void> {
    const templateUuid = this.configService.get('MAILTRAP_WELCOME_TEMPLATE');

    if (!templateUuid) {
      // Fallback to custom HTML template
      return this.sendWelcomeEmail(email, userName);
    }

    await this.sendMailWithTemplate({
      to: email,
      templateUuid,
      subject: "Obudur'a Hoş Geldiniz!",
      templateVariables: {
        user_name: userName,
        get_started_link:
          onboardingLinks?.getStartedLink || 'https://obudur.com/dashboard',
        onboarding_video_link:
          onboardingLinks?.onboardingVideoLink || 'https://obudur.com/help',
        next_step_link:
          onboardingLinks?.nextStepLink || 'https://obudur.com/profile',
      },
    });
  }

  /**
   * Send bulk template emails
   */
  async sendBulkTemplateEmails(
    recipients: Array<{
      email: string;
      variables: Record<string, any>;
    }>,
    templateUuid: string,
    batchSize = 10,
  ): Promise<void> {
    if (!this.mailtrapClient) {
      throw new Error(
        'Mailtrap API token not configured. Cannot use template method.',
      );
    }

    const batches = this.chunkArray(recipients, batchSize);

    for (const batch of batches) {
      const promises = batch.map((recipient) =>
        this.sendMailWithTemplate({
          to: recipient.email,
          templateUuid,
          templateVariables: recipient.variables,
        }).catch((error) => {
          this.logger.error(
            `Failed to send template email to ${recipient.email}`,
            error,
          );
          return null;
        }),
      );

      await Promise.all(promises);

      // Add delay between batches to avoid rate limiting
      if (batches.indexOf(batch) < batches.length - 1) {
        await this.delay(1000); // 1 second delay
      }
    }
  }

  private generateVerifyEmailTemplate(verifyCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Obudur Doğrulama</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: #4285f4;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .verify-button {
              display: inline-block;
              background-color: #4285f4;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
              transition: background-color 0.3s;
            }
            .verify-button:hover {
              background-color: #3367d6;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              font-size: 12px;
              color: #6c757d;
              text-align: center;
            }
            .warning {
              background-color: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 4px;
              padding: 15px;
              margin: 20px 0;
              color: #856404;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Obudur</div>
              <p>Hesap Doğrulama</p>
            </div>
            
            <p>Merhaba,</p>
            <p>Obudur hesabınızı doğrulamak için aşağıdaki butona tıklayın:</p>
            
            <div style="text-align: center;">
              <a href="https://obudur.com/eposta-dogrulama/${verifyCode}" class="verify-button">
                Hesabımı Doğrula
              </a>
            </div>
            
            <p>Alternatif olarak, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz:</p>
            <p style="word-break: break-all; color: #4285f4;">
              https://obudur.com/eposta-dogrulama/${verifyCode}
            </p>
            
            <div class="warning">
              <strong>Güvenlik Uyarısı:</strong> Eğer bu işlemi siz talep etmediyseniz, lütfen bu e-postayı dikkate almayın ve hesabınızın güvenliği için şifrenizi değiştirin.
            </div>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Obudur. Tüm hakları saklıdır.</p>
              <p>Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateForgotPasswordTemplate(forgotPasswordCode: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Obudur Şifre Sıfırlama</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: #dc3545;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .code-box {
              background-color: #f8f9fa;
              border: 2px solid #dc3545;
              border-radius: 8px;
              padding: 20px;
              text-align: center;
              margin: 20px 0;
            }
            .code {
              font-size: 32px;
              font-weight: bold;
              color: #dc3545;
              letter-spacing: 3px;
              font-family: 'Courier New', monospace;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              font-size: 12px;
              color: #6c757d;
              text-align: center;
            }
            .warning {
              background-color: #f8d7da;
              border: 1px solid #f5c6cb;
              border-radius: 4px;
              padding: 15px;
              margin: 20px 0;
              color: #721c24;
            }
            .expiry {
              background-color: #d1ecf1;
              border: 1px solid #bee5eb;
              border-radius: 4px;
              padding: 15px;
              margin: 20px 0;
              color: #0c5460;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Obudur</div>
              <p>Şifre Sıfırlama</p>
            </div>
            
            <p>Merhaba,</p>
            <p>Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:</p>
            
            <div class="code-box">
              <div class="code">${forgotPasswordCode}</div>
              <p style="margin: 10px 0 0 0; font-size: 14px; color: #6c757d;">
                Doğrulama Kodu
              </p>
            </div>
            
            <div class="expiry">
              <strong>Önemli:</strong> Bu kod 15 dakika boyunca geçerlidir. Süre dolmadan önce şifrenizi sıfırlayın.
            </div>
            
            <div class="warning">
              <strong>Güvenlik Uyarısı:</strong> Eğer şifre sıfırlama talebinde bulunmadıysanız, lütfen bu e-postayı dikkate almayın ve hesabınızın güvenliği için mevcut şifrenizi değiştirin.
            </div>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Obudur. Tüm hakları saklıdır.</p>
              <p>Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateWelcomeTemplate(name?: string): string {
    const greeting = name ? `Merhaba ${name}` : 'Merhaba';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Obudur'a Hoş Geldiniz</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: #28a745;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .welcome-message {
              background: linear-gradient(135deg, #28a745, #20c997);
              color: white;
              padding: 20px;
              border-radius: 8px;
              text-align: center;
              margin: 20px 0;
            }
            .cta-button {
              display: inline-block;
              background-color: #28a745;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              font-weight: bold;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              font-size: 12px;
              color: #6c757d;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Obudur</div>
            </div>
            
            <div class="welcome-message">
              <h2 style="margin: 0; font-size: 24px;">${greeting}!</h2>
              <p style="margin: 10px 0 0 0;">Obudur ailesine hoş geldiniz</p>
            </div>
            
            <p>Hesabınız başarıyla oluşturuldu. Artık Obudur'un tüm özelliklerinden yararlanabilirsiniz!</p>
            
            <div style="text-align: center;">
              <a href="https://obudur.com" class="cta-button">
                Uygulamayı Keşfet
              </a>
            </div>
            
            <p>Herhangi bir sorunuz varsa, destek ekibimizle iletişime geçmekten çekinmeyin.</p>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Obudur. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateNotificationTemplate(
    subject: string,
    message: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${subject}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f8f9fa;
            }
            .container {
              background: white;
              border: 1px solid #e9ecef;
              border-radius: 8px;
              padding: 30px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .logo {
              color: #17a2b8;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .message-content {
              background-color: #f8f9fa;
              border-left: 4px solid #17a2b8;
              padding: 20px;
              margin: 20px 0;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 1px solid #e9ecef;
              font-size: 12px;
              color: #6c757d;
              text-align: center;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">Obudur</div>
              <h2 style="color: #17a2b8; margin: 0;">${subject}</h2>
            </div>
            
            <div class="message-content">
              ${message}
            </div>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Obudur. Tüm hakları saklıdır.</p>
              <p>Bu otomatik bir e-postadır, lütfen yanıtlamayın.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Close the mail transporter connections
   */
  async closeConnection(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.logger.log('SMTP transporter connection closed');
    }

    // Mailtrap Client doesn't need explicit connection closing
    if (this.mailtrapClient) {
      this.logger.log('Mailtrap client connection will be closed automatically');
    }
  }
}

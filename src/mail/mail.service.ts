import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  constructor(private readonly mailerService: MailerService) {}

  async sendVerifyCode(verifyCode: string, email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Obudur Doğrulama Linkiniiz',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Iatro Doğrulama Kodu</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                border: 1px solid #eee;
                border-radius: 5px;
                padding: 20px;
              }
              .code {
                font-size: 24px;
                font-weight: bold;
                color: #4285f4;
                letter-spacing: 2px;
                padding: 10px;
                text-align: center;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #777;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 style="text-align: center; color: #4285f4;">Obudur</h1>
              <p>Merhaba,</p>
              <p>Hesabınızı doğrulamak için aşağıdaki linke tıklayın:</p>
              <a href="https://obudur-website.vercel.app/eposta-dogrulama/${verifyCode}">Hesabınızı Doğrula</a>
              <p>Eğer bu işlemi siz talep etmediyseniz, lütfen bu e-postayı dikkate almayınız.</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Obudur. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }

  async sendForgotPasswordMail(forgotPasswordCode: string, email: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Iatro Şifrenizi Yenilemek İçin Kodunuz',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Iatro Şifre Yenileme</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .container {
                border: 1px solid #eee;
                border-radius: 5px;
                padding: 20px;
              }
              .code {
                font-size: 24px;
                font-weight: bold;
                color: #698d73;
                letter-spacing: 2px;
                padding: 10px;
                text-align: center;
                margin: 20px 0;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #777;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h1 style="text-align: center; color: #698d73;">Iatro</h1>
              <p>Merhaba,</p>
              <p>Şifrenizi yenilemek için aşağıdaki kodu kullanın:</p>
              <div class="code">${forgotPasswordCode}</div>
              <p>Eğer bu işlemi siz talep etmediyseniz, lütfen bu e-postayı dikkate almayınız.</p>
              <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Iatro. Tüm hakları saklıdır.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
  }
}

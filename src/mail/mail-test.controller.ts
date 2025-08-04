import { Controller, Get, Post, Query } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailTestService } from './mail-test.service';

@Controller('mail-test')
export class MailTestController {
  constructor(
    private readonly mailService: MailService,
    private readonly mailTestService: MailTestService,
  ) {}

  @Get('/status')
  async checkStatus() {
    try {
      await this.mailService.verifyConnection();
      return {
        status: 'success',
        message: 'Mail service is working correctly',
        smtp: 'Connected',
        mailtrap_api: process.env.MAILTRAP_TOKEN
          ? 'Configured'
          : 'Not configured',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Mail service connection failed',
        error: error.message,
      };
    }
  }

  @Post('/run-all')
  async runAllTests() {
    await this.mailTestService.runAllTests();
    return {
      message: 'All mail tests executed. Check server logs and Mailtrap inbox.',
      note: 'Tests are running in background. Check console for results.',
    };
  }

  @Post('/basic')
  async testBasic(@Query('email') email = 'test@example.com') {
    try {
      await this.mailTestService.testBasicEmail();
      return {
        status: 'success',
        message: `Basic email test sent to ${email}`,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to send basic test email',
        error: error.message,
      };
    }
  }

  @Post('/verification')
  async testVerification(@Query('email') email = 'test@example.com') {
    try {
      await this.mailService.sendVerifyCode('TEST-123456', email);
      return {
        status: 'success',
        message: `Verification email sent to ${email}`,
        code: 'TEST-123456',
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to send verification email',
        error: error.message,
      };
    }
  }

  @Post('/template-verification')
  async testTemplateVerification(
    @Query('email') email = 'test@example.com',
    @Query('name') name = 'Test User',
  ) {
    try {
      await this.mailService.sendVerifyCodeWithTemplate(
        'TEMPLATE-789',
        email,
        name,
      );
      return {
        status: 'success',
        message: `Template verification email sent to ${email}`,
        code: 'TEMPLATE-789',
        user: name,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to send template verification email',
        error: error.message,
      };
    }
  }

  @Post('/password-reset')
  async testPasswordReset(
    @Query('email') email = 'test@example.com',
    @Query('name') name = 'Test User',
  ) {
    try {
      await this.mailService.sendForgotPasswordWithTemplate(
        'RESET-456',
        email,
        name,
      );
      return {
        status: 'success',
        message: `Password reset email sent to ${email}`,
        code: 'RESET-456',
        user: name,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to send password reset email',
        error: error.message,
      };
    }
  }

  @Post('/welcome')
  async testWelcome(
    @Query('email') email = 'test@example.com',
    @Query('name') name = 'Test User',
  ) {
    try {
      await this.mailService.sendWelcomeEmailWithTemplate(email, name, {
        getStartedLink: 'https://obudur.com/get-started',
        onboardingVideoLink: 'https://obudur.com/help',
        nextStepLink: 'https://obudur.com/dashboard',
      });
      return {
        status: 'success',
        message: `Welcome email sent to ${email}`,
        user: name,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to send welcome email',
        error: error.message,
      };
    }
  }

  @Post('/custom-template')
  async testCustomTemplate(
    @Query('email') email = 'test@example.com',
    @Query('template') templateUuid = '26d43714-4680-4be5-aaa9-41fe8cc9d65a',
  ) {
    try {
      await this.mailService.sendMailWithTemplate({
        to: email,
        templateUuid,
        templateVariables: {
          user_name: 'Test User',
          next_step_link: 'https://obudur.com/next',
          get_started_link: 'https://obudur.com/start',
          onboarding_video_link: 'https://obudur.com/video',
          custom_message: 'This is a test of the custom template!',
          current_date: new Date().toLocaleDateString('tr-TR'),
        },
      });
      return {
        status: 'success',
        message: `Custom template email sent to ${email}`,
        template: templateUuid,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to send custom template email',
        error: error.message,
      };
    }
  }

  @Post('/bulk-test')
  async testBulk() {
    try {
      const recipients = [
        'test1@example.com',
        'test2@example.com',
        'test3@example.com',
      ];

      await this.mailService.sendBulkEmails(
        recipients,
        'Bulk Test Email',
        `
          <h1>Bulk Email Test</h1>
          <p>This is a test of the bulk email functionality.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        `,
        2, // batch size
      );

      return {
        status: 'success',
        message: `Bulk emails sent to ${recipients.length} recipients`,
        recipients,
        batchSize: 2,
      };
    } catch (error) {
      return {
        status: 'error',
        message: 'Failed to send bulk emails',
        error: error.message,
      };
    }
  }

  @Get('/config')
  async getConfig() {
    return {
      smtp: {
        host: process.env.MAIL_HOST || 'Not configured',
        port: process.env.MAIL_PORT || 'Not configured',
        user: process.env.MAIL_USER ? '***configured***' : 'Not configured',
        from: process.env.MAIL_FROM || 'Not configured',
      },
      mailtrap_api: {
        token: process.env.MAILTRAP_TOKEN
          ? '***configured***'
          : 'Not configured',
        verify_template:
          process.env.MAILTRAP_VERIFY_TEMPLATE || 'Not configured',
        reset_template: process.env.MAILTRAP_RESET_TEMPLATE || 'Not configured',
        welcome_template:
          process.env.MAILTRAP_WELCOME_TEMPLATE || 'Not configured',
      },
    };
  }
}

import { Injectable, Logger } from '@nestjs/common';
import { MailService } from './mail.service';

/**
 * Example service demonstrating how to use the Mail Service
 * This shows both SMTP and Mailtrap API methods
 */
@Injectable()
export class MailTestService {
  private readonly logger = new Logger(MailTestService.name);

  constructor(private readonly mailService: MailService) {}

  /**
   * Test basic SMTP email sending
   */
  async testBasicEmail(email = 'test@example.com'): Promise<void> {
    try {
      await this.mailService.sendMail({
        to: email,
        subject: 'Test Email from Obudur',
        html: `
          <h1>Test Email</h1>
          <p>This is a test email sent from the Obudur mail service.</p>
          <p>Sent at: ${new Date().toISOString()}</p>
        `,
      });

      this.logger.log(`Basic test email sent successfully to ${email}`);
    } catch (error) {
      this.logger.error('Failed to send basic test email', error);
    }
  }

  /**
   * Test verification email with custom HTML template
   */
  async testVerificationEmail(): Promise<void> {
    try {
      await this.mailService.sendVerifyCode(
        'test-verify-code-123',
        'test@example.com',
      );

      this.logger.log('Verification email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send verification email', error);
    }
  }

  /**
   * Test verification email with Mailtrap template (if configured)
   */
  async testVerificationEmailWithTemplate(): Promise<void> {
    try {
      await this.mailService.sendVerifyCodeWithTemplate(
        'test-verify-code-456',
        'test@example.com',
        'Test User',
      );

      this.logger.log('Template verification email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send template verification email', error);
    }
  }

  /**
   * Test password reset email
   */
  async testPasswordResetEmail(): Promise<void> {
    try {
      await this.mailService.sendForgotPasswordWithTemplate(
        'reset-code-789',
        'test@example.com',
        'Test User',
      );

      this.logger.log('Password reset email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send password reset email', error);
    }
  }

  /**
   * Test welcome email with custom onboarding links
   */
  async testWelcomeEmail(): Promise<void> {
    try {
      await this.mailService.sendWelcomeEmailWithTemplate(
        'test@example.com',
        'Test User',
        {
          getStartedLink: 'https://obudur.com/get-started?user=test',
          onboardingVideoLink: 'https://obudur.com/onboarding-video',
          nextStepLink: 'https://obudur.com/next-step?step=1',
        },
      );

      this.logger.log('Welcome email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send welcome email', error);
    }
  }

  /**
   * Test Mailtrap template with custom variables
   */
  async testCustomTemplate(): Promise<void> {
    try {
      // This would use the template UUID from your Mailtrap dashboard
      await this.mailService.sendMailWithTemplate({
        to: 'test@example.com',
        templateUuid: '26d43714-4680-4be5-aaa9-41fe8cc9d65a', // Example UUID
        templateVariables: {
          user_name: 'Test User',
          next_step_link: 'https://obudur.com/next',
          get_started_link: 'https://obudur.com/start',
          onboarding_video_link: 'https://obudur.com/video',
          custom_message: 'Welcome to our platform!',
          current_date: new Date().toLocaleDateString(),
        },
      });

      this.logger.log('Custom template email sent successfully');
    } catch (error) {
      this.logger.error('Failed to send custom template email', error);
    }
  }

  /**
   * Test bulk email sending
   */
  async testBulkEmails(): Promise<void> {
    try {
      const recipients = [
        {
          email: 'user1@example.com',
          variables: {
            user_name: 'User One',
            custom_field: 'Value 1',
          },
        },
        {
          email: 'user2@example.com',
          variables: {
            user_name: 'User Two',
            custom_field: 'Value 2',
          },
        },
        {
          email: 'user3@example.com',
          variables: {
            user_name: 'User Three',
            custom_field: 'Value 3',
          },
        },
      ];

      await this.mailService.sendBulkTemplateEmails(
        recipients,
        '26d43714-4680-4be5-aaa9-41fe8cc9d65a', // Template UUID
        2, // Batch size
      );

      this.logger.log('Bulk template emails sent successfully');
    } catch (error) {
      this.logger.error('Failed to send bulk template emails', error);
    }
  }

  /**
   * Test email with attachments
   */
  async testEmailWithAttachments(): Promise<void> {
    try {
      const pdfContent = Buffer.from('%PDF-1.4 Test PDF content');
      const csvContent = 'name,email\nTest User,test@example.com';

      await this.mailService.sendMail({
        to: 'test@example.com',
        subject: 'Email with Attachments',
        html: `
          <h1>Documents Attached</h1>
          <p>Please find the requested documents attached to this email.</p>
          <ul>
            <li>Sample Report (PDF)</li>
            <li>User Data (CSV)</li>
          </ul>
        `,
        attachments: [
          {
            filename: 'sample-report.pdf',
            content: pdfContent,
            contentType: 'application/pdf',
          },
          {
            filename: 'user-data.csv',
            content: csvContent,
            contentType: 'text/csv',
          },
        ],
      });

      this.logger.log('Email with attachments sent successfully');
    } catch (error) {
      this.logger.error('Failed to send email with attachments', error);
    }
  }

  /**
   * Test connection and run all tests
   */
  async runAllTests(): Promise<void> {
    this.logger.log('Starting mail service tests...');

    // Verify connection first
    try {
      await this.mailService.verifyConnection();
      this.logger.log('Mail service connection verified');
    } catch (error) {
      this.logger.error('Mail service connection failed', error);
      return;
    }

    // Run all test methods
    const tests = [
      'testBasicEmail',
      'testVerificationEmail',
      'testVerificationEmailWithTemplate',
      'testPasswordResetEmail',
      'testWelcomeEmail',
      'testCustomTemplate',
      'testBulkEmails',
      'testEmailWithAttachments',
    ];

    for (const testMethod of tests) {
      try {
        await this[testMethod]();
        await this.delay(500); // Small delay between tests
      } catch (error) {
        this.logger.error(`Test ${testMethod} failed`, error);
      }
    }

    this.logger.log('All mail service tests completed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

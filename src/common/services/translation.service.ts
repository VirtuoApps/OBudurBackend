import { Injectable, Logger } from '@nestjs/common';

import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class TranslationService {
  private readonly logger = new Logger(TranslationService.name);
  private readonly genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GOOGLE_AI_API_KEY not found in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || '');
  }

  async translateToEnglish(turkishText: string): Promise<string> {
    try {
      if (!turkishText || turkishText.trim() === '') {
        return '';
      }

      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash-lite' });

      const prompt = `Translate the following Turkish text to English. Only return the translation, no additional text or explanations:

${turkishText}`;

      const result = await model.generateContent(prompt);
      const response = result.response;
      const translatedText = response.text();

      this.logger.log(`Translated: "${turkishText}" -> "${translatedText}"`);

      return translatedText.trim();
    } catch (error) {
      this.logger.error(`Failed to translate text: ${turkishText}`, error);
      // Return the original text if translation fails
      return turkishText;
    }
  }

  async translateRecord(record: Record<string, string>): Promise<Record<string, string>> {
    const result: Record<string, string> = { ...record };

    // If Turkish translation exists but English doesn't, translate it
    if (record.tr && !record.en) {
      try {
        result.en = await this.translateToEnglish(record.tr);
      } catch (error) {
        this.logger.error('Failed to translate record', error);
        // Keep English empty if translation fails
        result.en = '';
      }
    }

    return result;
  }

  async translateMultipleRecords(records: Record<string, string>[]): Promise<Record<string, string>[]> {
    const translatedRecords = await Promise.all(
      records.map(record => this.translateRecord(record))
    );
    return translatedRecords;
  }
}

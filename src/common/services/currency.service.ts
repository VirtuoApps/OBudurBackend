import { Injectable, Logger } from '@nestjs/common';

export interface ExchangeRate {
  buyingRate: number;
  sellingRate: number;
  date: Date;
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private cachedRate: ExchangeRate | null = null;
  private lastFetchTime: Date | null = null;
  private readonly CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache

  async getUsdToTryRate(): Promise<ExchangeRate> {
    // Return cached rate if it's still fresh (less than 1 hour old)
    if (
      this.cachedRate &&
      this.lastFetchTime &&
      Date.now() - this.lastFetchTime.getTime() < this.CACHE_DURATION
    ) {
      return this.cachedRate;
    }

    try {
      const response = await fetch('https://www.tcmb.gov.tr/kurlar/today.xml');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const xmlData = await response.text();
      // Parse XML manually to extract USD rate
      const usdMatch = xmlData.match(
        /<Currency[^>]*CurrencyCode="USD"[^>]*>[\s\S]*?<\/Currency>/i,
      );
      if (!usdMatch) {
        throw new Error('USD currency not found in TCMB data');
      }
      const usdSection = usdMatch[0];
      const buyingRateMatch = usdSection.match(
        /<ForexBuying>([\d.]+)<\/ForexBuying>/i,
      );
      const sellingRateMatch = usdSection.match(
        /<ForexSelling>([\d.]+)<\/ForexSelling>/i,
      );

      if (!buyingRateMatch || !sellingRateMatch) {
        throw new Error('Could not extract USD rates from TCMB data');
      }

      const exchangeRate: ExchangeRate = {
        buyingRate: parseFloat(buyingRateMatch[1]),
        sellingRate: parseFloat(sellingRateMatch[1]),
        date: new Date(),
      };

      // Cache the result
      this.cachedRate = exchangeRate;
      this.lastFetchTime = new Date();

      this.logger.log(`Fetched USD/TRY rate: ${exchangeRate.buyingRate}`);
      return exchangeRate;
    } catch (error) {
      this.logger.error('Failed to fetch exchange rate from TCMB', error);

      // Return a fallback rate if API fails (you might want to store this in config)
      const fallbackRate: ExchangeRate = {
        buyingRate: 39.5, // Approximate fallback rate
        sellingRate: 40.0,
        date: new Date(),
      };

      this.logger.warn(
        `Using fallback USD/TRY rate: ${fallbackRate.buyingRate}`,
      );
      return fallbackRate;
    }
  }

  /**
   * Convert TRY amount to USD
   */
  async convertTryToUsd(tryAmount: number): Promise<number> {
    const rate = await this.getUsdToTryRate();
    // Use buying rate for conversion (TRY -> USD)
    const usdAmount = tryAmount / rate.buyingRate;
    return Math.round(usdAmount * 100) / 100; // Round to 2 decimal places
  }
}

// eids.controller.ts
import { Controller, Get, Post, Query, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { EidsService } from './eids.service';

@Controller('api/v1/eids')
export class EidsController {
  constructor(private readonly eidsService: EidsService) {}

  // EIDS servisinin yönlendireceği callback endpoint.
  @Get('callback')
  // (Not: İhtiyaca göre @Post olarak da tanımlanabilir)
  async handleEidsCallback(
    @Query('code') code?: string,        // Eğer EIDS kodu query parametresi olarak geliyorsa
    @Query('phone') phoneParam?: string, // (Varsayımsal) telefon da query'de gelebilir
  ) {
    // Güvenlik ve kullanım durumuna göre code ve phone bilgisini @Req (kullanıcı oturumu) veya @Body üzerinden de alabilirsiniz.
    const phoneNumber = phoneParam /* veya oturumdan/alınan kullanıcı telefonu */;
    const authorizationCode = code;

    if (!authorizationCode) {
      // Kod gelmediyse, hatalı istek
      return { success: false, message: 'Yetki kodu bulunamadı' };
    }
    if (!phoneNumber) {
      // Telefon numarası yoksa (kullanıcı oturumundan da alınamıyorsa) hata döndür
      return { success: false, message: 'Telefon numarası belirtilmedi' };
    }

    // Servis katmanında kod doğrulamasını yap
    const result = await this.eidsService.verifyAuthorizationCode(phoneNumber, authorizationCode);
    return result;  // result zaten { success: ..., message: ... } formatında
  }
}

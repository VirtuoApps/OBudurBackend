// eids.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { HttpService } from '@nestjs/axios';
import { Model } from 'mongoose';
import { firstValueFrom } from 'rxjs';

import { User, UserDocument } from '../common/schemas/Users.schema';

@Injectable()
export class EidsService {
  // User modelini ve HttpService'i enjekte ediyoruz
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private httpService: HttpService
  ) {}

  /**
   * Gelen yetki kodunu kullanarak EIDS doğrulaması yapar.
   * @param phone Kullanıcının telefon numarası (DB'deki ile eşleştirilecek)
   * @param code EIDS'ten gelen yetki kodu
   */
  async verifyAuthorizationCode(phone: string, code: string) {
    // 1. Adım: Telefona göre kullanıcıyı veritabanında bul
    const user = await this.userModel.findOne({ phoneNumber: phone }).exec();
    if (!user) {
      // Belirtilen telefon numarası ile bir kullanıcı bulunamadı
      throw new HttpException({ success: false, message: 'Kullanıcı bulunamadı' }, HttpStatus.NOT_FOUND);
    }

    // 2. Adım: EIDS servisine yetki kodunu doğrulat
    const EIDS_USERNAME = process.env.EIDS_USER;
    const EIDS_PASSWORD = process.env.EIDS_PASS;
    const EIDS_API_URL = process.env.EIDS_API_URL || 'https://eids.test.api/verify';  // Örnek API endpoint

    try {
      // EIDS API'ye HTTP isteği gönder (temel kimlik doğrulama ile)
      const response = await firstValueFrom(
        this.httpService.post(
          EIDS_API_URL,
          { code, phoneNumber: phone },  // gerekliyse telefon ve kod payload olarak gönderiliyor
          { auth: { username: EIDS_USERNAME, password: EIDS_PASSWORD } }
        )
      );
      const data = response.data;

      // EIDS servisi başarılı bir yanıt verdiyse (ör. doğrulama geçti)
      if (data && data.success) {
        // 3. Adım: Gerekirse kullanıcı verisini güncelle (ör. isEidsVerified=true)
        user.isEidsVerified = true;
        await user.save();

        // Başarılı sonucu döndür (gerekli bilgilerle)
        return { success: true, message: 'EIDS doğrulaması başarılı', userId: user._id };
      } else {
        // EIDS servisi kodu başarısız doğruladıysa
        return { success: false, message: 'Yetki kodu geçersiz veya süresi dolmuş' };
      }
    } catch (error) {
      // EIDS servisine istek atarken bir hata oluştu
      throw new HttpException(
        { success: false, message: 'EIDS servisi erişimi başarısız', detail: error.message },
        HttpStatus.BAD_GATEWAY
      );
    }
  }
}

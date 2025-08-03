import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { User } from 'src/common/schemas/Users.schema';
import { RegisterDto } from './dto/register.dto';
import errorCodes from 'src/common/errorCodes/errorCodes';
import { LoginDto } from './dto/login.dto';
import { MailService } from 'src/mail/mail.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { UpdateMineAccountDto } from './dto/update-mine-account.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private users: Model<User>,
    private jwtService: JwtService,
    private mailService: MailService,
  ) {}

  async mine(userId: string) {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.USER_NOT_FOUND,
        message: 'Kullanıcı bulunamadı',
        statusCode: 404,
      });
    }

    return user;
  }

  async updateMineAccount(
    userId: string,
    updateMineAccountDto: UpdateMineAccountDto,
  ) {
    const {
      email,
      password,
      firstName,
      lastName,
      phoneNumber,
      profilePicture,
      birthDate,
      estateAgency,
    } = updateMineAccountDto;

    const user = await this.users.findById(userId);

    console.log({
      birthDate,
    });

    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.USER_NOT_FOUND,
        message: 'Kullanıcı bulunamadı',
        statusCode: 404,
      });
    }

    const updateData: any = {};

    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) {
      updateData.phoneNumber = phoneNumber;

      const checkIsPhoneNumberExists = await this.users.findOne({
        phoneNumber,
        _id: { $ne: userId },
      });

      if (checkIsPhoneNumberExists) {
        throw new BadRequestException({
          errorCode: errorCodes.PHONE_NUMBER_ALREADY_EXISTS,
          message: 'Bu telefon numarası zaten kullanılıyor',
          statusCode: 400,
        });
      }
    }
    if (profilePicture) updateData.profilePicture = profilePicture;
    if (birthDate) updateData.birthDate = new Date(birthDate);
    if (estateAgency) updateData.estateAgency = estateAgency;
    if (email && email !== user.email) {
      const emailExists = await this.users.findOne({
        email,
        _id: { $ne: userId },
      });

      if (emailExists) {
        throw new BadRequestException({
          errorCode: errorCodes.EMAIL_ALREADY_EXISTS,
          message: 'E-Posta adresi zaten kullanılıyor',
          statusCode: 400,
        });
      }

      updateData.email = email;
    }

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await this.users.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true },
    );

    const tokens = this.generateTokens(updatedUser);

    return {
      accessToken: tokens.accessToken,
      ...updatedUser.toObject(),
    };
  }

  /**
   * Generates JWT access token for a user
   * @param user - The user object containing email and verification status
   * @returns Object containing the generated access token
   */
  generateTokens(user: User) {
    const accessToken = this.jwtService.sign(
      {
        email: user.email,
        verified: user.verified,
      },
      {
        secret: process.env.JWT_ACCESS_TOKEN_SECRET,
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES,
      },
    );

    return {
      accessToken,
    };
  }

  /**
   * Registers a new user in the system
   * @param registerDto - Data transfer object containing registration details
   * @returns Object containing the access token for the new user
   * @throws BadRequestException if email already exists
   */
  async register(registerDto: RegisterDto) {
    const { email, password } = registerDto;

    const existsUser = await this.users.findOne({ email });

    if (existsUser) {
      throw new BadRequestException({
        errorCode: errorCodes.EMAIL_ALREADY_EXISTS,
        message: 'E-Posta adresi zaten kullanılıyor',
        statusCode: 400,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = uuidv4();

    await this.mailService.sendVerifyCodeWithTemplate(
      verificationToken,
      email,
    );

    const newUser = await this.users.create({
      email,
      password: hashedPassword,
      createdAt: new Date(),
      emailVerifyCode: verificationToken,
      role: 'user',
    });

    const tokens = this.generateTokens(newUser);

    return {
      accessToken: tokens.accessToken,
    };
  }

  /**
   * Authenticates a user and generates access token
   * @param loginDto - Data transfer object containing login credentials
   * @returns Object containing the access token
   * @throws NotFoundException if email is invalid
   * @throws BadRequestException if password is invalid
   */
  async login(loginDto: LoginDto) {
    const { email } = loginDto;

    const user = await this.users.findOne({ email });

    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.INVALID_EMAIL,
        message: 'Bu e-posta adresiyle kayıtlı bir hesap bulunamadı',
        statusCode: 404,
      });
    }

    //Bcrypt compare password
    const isPasswordMatch = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordMatch) {
      throw new BadRequestException({
        errorCode: errorCodes.INVALID_PASSWORD,
        message: 'Şifreniz yanlış',
        statusCode: 400,
      });
    }

    // Check if email is verified
    if (!user.verified) {
      throw new BadRequestException({
        errorCode: errorCodes.EMAIL_NOT_FOUND, // Using existing error code temporarily
        message: 'Lütfen önce e-posta adresinizi doğrulayın',
        statusCode: 400,
      });
    }

    const tokens = this.generateTokens(user);

    return {
      accessToken: tokens.accessToken,
    };
  }

  /**
   * Verifies a user's email using the verification token
   * @param verifyToken - The verification token sent to user's email
   * @returns Object containing success status and message
   * @throws NotFoundException if verification token is invalid
   */
  async verifyEmail(verifyToken: string) {
    const user = await this.users.findOne({
      emailVerifyCode: verifyToken,
    });

    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.INVALID_CODE,
        message: 'Geçersiz doğrulama bağlantısı, lütfen tekrar deneyin',
        statusCode: 404,
      });
    }

    await this.users.findByIdAndUpdate(user._id, {
      $set: {
        verified: true,
        emailVerifyCode: null, // Clear the verification token
      },
    });

    return {
      status: 'success',
      message: 'E-posta başarıyla doğrulandı',
    };
  }

  /**
   * Resends verification email to user
   * @param userId - The ID of the user requesting verification email
   * @returns Object containing success status and message
   * @throws NotFoundException if user not found
   * @throws BadRequestException if email already verified or code recently sent
   */
  async resendVerifyEmail(userId: string) {
    const user = await this.users.findById(userId);

    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.EMAIL_NOT_FOUND,
        message:
          'E-posta adresi bulunamadı, lütfen e-posta adresinizi kontrol edin',
        statusCode: 404,
      });
    }

    if (user.verified) {
      throw new BadRequestException({
        errorCode: errorCodes.EMAIL_ALREADY_VERIFIED,
        message: 'E-posta zaten doğrulanmış',
        statusCode: 400,
      });
    }

    if (user.verifySendDate) {
      //Check is 10 minutes passed
      const dateNow = new Date();
      const diff = dateNow.getTime() - user.verifySendDate.getTime();

      if (diff < 600000) {
        throw new BadRequestException({
          errorCode: errorCodes.FORGOT_PASSWORD_CODE_ALREADY_SENT,
          message:
            'Doğrulama e-postası talebini her 10 dakikada bir gönderebilirsiniz',
          statusCode: 400,
        });
      }
    }

    const verificationToken = uuidv4();

    await this.mailService.sendVerifyCodeWithTemplate(
      verificationToken,
      user.email,
    );

    await this.users.findByIdAndUpdate(user._id, {
      $set: {
        emailVerifyCode: verificationToken,
        verifySendDate: new Date(),
      },
    });

    return {
      status: 'success',
      message: 'Doğrulama kodu e-posta adresinize gönderildi',
    };
  }

  /**
   * Initiates the forgot password process
   * @param forgotPasswordDto - Data transfer object containing user's email
   * @returns Object containing success status and message
   * @throws NotFoundException if email not found
   * @throws BadRequestException if code was recently sent
   */
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const { email } = forgotPasswordDto;

    const user = await this.users.findOne({ email });

    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.EMAIL_NOT_FOUND,
        message:
          'E-posta adresi bulunamadı, lütfen e-posta adresinizi kontrol edin',
        statusCode: 404,
      });
    }

    const generatedSixDigitCode = Math.floor(100000 + Math.random() * 900000);

    await this.users.findByIdAndUpdate(user._id, {
      $set: {
        forgotPasswordCode: generatedSixDigitCode,
        forgotPasswordSendDate: new Date(),
      },
    });

    await this.mailService.sendForgotPasswordMail(
      generatedSixDigitCode.toString(),
      user.email,
    );

    return {
      status: 'success',
      message: 'Şifre sıfırlama kodu e-posta adresinize gönderildi',
    };
  }

  /**
   * Resets user's password using forgot password code
   * @param forgotPasswordCode - The code sent to user's email
   * @param resetPasswordDto - Data transfer object containing new password
   * @returns Object containing success status and message
   * @throws NotFoundException if forgot password code is invalid
   */
  async resetPassword(
    forgotPasswordCode: string,
    resetPasswordDto: ResetPasswordDto,
  ) {
    const { password } = resetPasswordDto;

    const user = await this.users.findOne({
      forgotPasswordCode,
    });

    if (!user) {
      throw new NotFoundException({
        errorCode: errorCodes.INVALID_CODE,
        message:
          'Geçersiz kod, lütfen "forgotPasswordCode" değerinizi kontrol edin',
        statusCode: 404,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.users.findByIdAndUpdate(user._id, {
      $set: {
        password: hashedPassword,
        forgotPasswordCode: null,
        forgotPasswordSendDate: null,
      },
    });

    return {
      status: 'success',
      message: 'Şifre başarıyla sıfırlandı',
    };
  }
}

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { UserId } from 'src/common/decorators/user-id.decarator';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/mine')
  @UseGuards(AuthGuard('jwt'))
  mine(@UserId() userId: string) {
    return this.authService.mine(userId);
  }

  @Post('/register')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('/login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('/resend-verify-email')
  @UseGuards(AuthGuard('jwt'))
  resendVerifyEmail(@UserId() userId: string) {
    return this.authService.resendVerifyEmail(userId);
  }

  @Patch('/verify-email/:verifyCode')
  verifyEmail(@Param('verifyCode') verifyCode: string) {
    return this.authService.verifyEmail(verifyCode);
  }

  @Post('/forgot-password')
  @UsePipes(ValidationPipe)
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Patch('/reset-password/:forgotPasswordCode')
  @UsePipes(ValidationPipe)
  resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto,
    @Param('forgotPasswordCode') forgotPasswordCode: string,
  ) {
    return this.authService.resetPassword(forgotPasswordCode, resetPasswordDto);
  }
}

import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SetMessageSeenDto {
  @IsNotEmpty()
  @IsBoolean()
  isSeen: boolean;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta gir.' })
  email!: string;

  @ApiProperty({ example: 'gizliSifre123' })
  @IsString()
  @MinLength(1, { message: 'Şifre zorunlu.' })
  password!: string;
}

import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ResendDto {
  @ApiProperty({ example: 'ali@example.com' })
  @IsEmail({}, { message: 'Geçerli bir e-posta gir.' })
  email!: string;
}

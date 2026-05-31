import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class RejectDto {
  @ApiProperty({ example: 'Bayi belgeleri eksik.' })
  @IsString()
  @MinLength(3, { message: 'Red sebebi en az 3 karakter olmalı.' })
  reason!: string;
}

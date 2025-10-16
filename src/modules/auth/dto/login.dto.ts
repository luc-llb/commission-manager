import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'Nome de usuário',
    example: 'admin',
  })
  @IsString()
  @IsNotEmpty({ message: 'O username é obrigatório' })
  username: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'admin123',
  })
  @IsString()
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  password: string;
}

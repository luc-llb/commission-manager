import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { VendedoresService } from './vendedores.service';
import { CreateVendedorDto } from './dto/create-vendedor.dto';
import { UpdateVendedorDto } from './dto/update-vendedor.dto';

@ApiTags('Vendedores')
@ApiBearerAuth()
@Controller('vendedores')
export class VendedoresController {
  constructor(private readonly vendedoresService: VendedoresService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo vendedor' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Vendedor criado com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'Email ou CPF já cadastrado' })
  create(@Body() createVendedorDto: CreateVendedorDto) {
    return this.vendedoresService.create(createVendedorDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os vendedores' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de vendedores retornada com sucesso' })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  findAll(@Query('ativo') ativo?: boolean) {
    return this.vendedoresService.findAll(ativo);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar vendedor por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Vendedor encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Vendedor não encontrado' })
  findOne(@Param('id') id: string) {
    return this.vendedoresService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar vendedor' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Vendedor atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Vendedor não encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updateVendedorDto: UpdateVendedorDto) {
    return this.vendedoresService.update(id, updateVendedorDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover vendedor' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Vendedor removido com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Vendedor não encontrado' })
  remove(@Param('id') id: string) {
    return this.vendedoresService.remove(id);
  }
}

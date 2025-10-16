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
import { ProdutosService } from './produtos.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';

@ApiTags('Produtos')
@ApiBearerAuth()
@Controller('produtos')
export class ProdutosController {
  constructor(private readonly produtosService: ProdutosService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto' })
  @ApiResponse({ status: HttpStatus.CREATED, description: 'Produto criado com sucesso' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  @ApiResponse({ status: HttpStatus.CONFLICT, description: 'SKU já cadastrado' })
  create(@Body() createProdutoDto: CreateProdutoDto) {
    return this.produtosService.create(createProdutoDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Lista de produtos retornada com sucesso' })
  @ApiQuery({ name: 'ativo', required: false, type: Boolean })
  @ApiQuery({ name: 'categoria', required: false, type: String })
  findAll(@Query('ativo') ativo?: boolean, @Query('categoria') categoria?: string) {
    return this.produtosService.findAll(ativo, categoria);
  }

  @Get('buscar')
  @ApiOperation({ summary: 'Buscar produtos por texto (nome ou descrição)' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Produtos encontrados' })
  @ApiQuery({ name: 'q', required: true, type: String })
  search(@Query('q') query: string) {
    return this.produtosService.search(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar produto por ID' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Produto encontrado' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Produto não encontrado' })
  findOne(@Param('id') id: string) {
    return this.produtosService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar produto' })
  @ApiResponse({ status: HttpStatus.OK, description: 'Produto atualizado com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Produto não encontrado' })
  @ApiResponse({ status: HttpStatus.BAD_REQUEST, description: 'Dados inválidos' })
  update(@Param('id') id: string, @Body() updateProdutoDto: UpdateProdutoDto) {
    return this.produtosService.update(id, updateProdutoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover produto' })
  @ApiResponse({ status: HttpStatus.NO_CONTENT, description: 'Produto removido com sucesso' })
  @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Produto não encontrado' })
  remove(@Param('id') id: string) {
    return this.produtosService.remove(id);
  }
}

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  NotFoundException,
} from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Holding } from './domain/holding';
import { AuthGuard } from '@nestjs/passport';
import { PortfolioDto } from './dto/portfolio.dto';
import { NullableType } from '../utils/types/nullable.type';
import type { RequestWithUser } from '../utils/types/request-with-user.type';
import type { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';

@ApiTags('Holdings')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller({
  path: 'holdings',
  version: '1',
})
export class HoldingsController {
  constructor(private readonly holdingsService: HoldingsService) {}

  @Post()
  @ApiCreatedResponse({
    type: Holding,
  })
  create(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Body() createHoldingDto: CreateHoldingDto,
  ) {
    // Ownership always comes from the authenticated token, never from the body.
    createHoldingDto.user = { id: request.user.id };
    return this.holdingsService.create(createHoldingDto);
  }

  @Get()
  @ApiOkResponse({
    type: PortfolioDto,
    description:
      "The authenticated user's holdings, aggregated per asset type for the dashboard.",
  })
  getPortfolio(
    @Request() request: RequestWithUser<JwtPayloadType>,
  ): Promise<PortfolioDto> {
    return this.holdingsService.getPortfolioForUser(request.user.id);
  }

  @Get(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Holding,
  })
  async findById(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Param('id') id: string,
  ) {
    const holding = await this.holdingsService.findById(id);
    return this.assertOwned(holding, request.user.id);
  }

  @Patch(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @ApiOkResponse({
    type: Holding,
  })
  async update(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Param('id') id: string,
    @Body() updateHoldingDto: UpdateHoldingDto,
  ) {
    const holding = await this.holdingsService.findById(id);
    this.assertOwned(holding, request.user.id);
    // Ownership can't be reassigned via update.
    updateHoldingDto.user = undefined;
    return this.holdingsService.update(id, updateHoldingDto);
  }

  @Delete(':id')
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  async remove(
    @Request() request: RequestWithUser<JwtPayloadType>,
    @Param('id') id: string,
  ) {
    const holding = await this.holdingsService.findById(id);
    this.assertOwned(holding, request.user.id);
    return this.holdingsService.remove(id);
  }

  private assertOwned(
    holding: NullableType<Holding>,
    userId: JwtPayloadType['id'],
  ): Holding {
    // 404 rather than 403 so ownership of other users' holdings isn't
    // revealed by response code.
    if (!holding || holding.user?.id !== userId) {
      throw new NotFoundException();
    }
    return holding;
  }
}

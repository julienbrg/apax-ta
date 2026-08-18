import { UsersService } from '../users/users.service';
import { User } from '../users/domain/user';

import {
  // common
  Injectable,
  HttpStatus,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateHoldingDto } from './dto/create-holding.dto';
import { UpdateHoldingDto } from './dto/update-holding.dto';
import { HoldingRepository } from './infrastructure/persistence/holding.repository';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { Holding } from './domain/holding';
import { AssetTypeEnum } from './asset-type.enum';
import { PortfolioDto } from './dto/portfolio.dto';

@Injectable()
export class HoldingsService {
  constructor(
    private readonly userService: UsersService,

    // Dependencies here
    private readonly holdingRepository: HoldingRepository,
  ) {}

  async create(createHoldingDto: CreateHoldingDto) {
    // Do not remove comment below.
    // <creating-property />
    let user: User | undefined = undefined;

    if (createHoldingDto.user) {
      const userObject = await this.userService.findById(
        createHoldingDto.user.id,
      );
      if (!userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'notExists',
          },
        });
      }
      user = userObject;
    }

    return this.holdingRepository.create({
      // Do not remove comment below.
      // <creating-property-payload />
      user,

      amount: createHoldingDto.amount,

      assetType: createHoldingDto.assetType,
    });
  }

  findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }) {
    return this.holdingRepository.findAllWithPagination({
      paginationOptions: {
        page: paginationOptions.page,
        limit: paginationOptions.limit,
      },
    });
  }

  findById(id: Holding['id']) {
    return this.holdingRepository.findById(id);
  }

  findByIds(ids: Holding['id'][]) {
    return this.holdingRepository.findByIds(ids);
  }

  async getPortfolioForUser(userId: User['id']): Promise<PortfolioDto> {
    const holdings = await this.holdingRepository.findByUserId(userId);

    const portfolio: PortfolioDto = {
      [AssetTypeEnum.gold]: { amount: 0, updatedAt: null },
      [AssetTypeEnum.silver]: { amount: 0, updatedAt: null },
      [AssetTypeEnum.platinum]: { amount: 0, updatedAt: null },
    };

    for (const holding of holdings) {
      const bucket = portfolio[holding.assetType];
      bucket.amount += holding.amount;
      if (!bucket.updatedAt || holding.updatedAt > bucket.updatedAt) {
        bucket.updatedAt = holding.updatedAt;
      }
    }

    return portfolio;
  }

  async update(
    id: Holding['id'],

    updateHoldingDto: UpdateHoldingDto,
  ) {
    // Do not remove comment below.
    // <updating-property />
    let user: User | undefined = undefined;

    if (updateHoldingDto.user) {
      const userObject = await this.userService.findById(
        updateHoldingDto.user.id,
      );
      if (!userObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            user: 'notExists',
          },
        });
      }
      user = userObject;
    }

    return this.holdingRepository.update(id, {
      // Do not remove comment below.
      // <updating-property-payload />
      user,

      amount: updateHoldingDto.amount,

      assetType: updateHoldingDto.assetType,
    });
  }

  remove(id: Holding['id']) {
    return this.holdingRepository.remove(id);
  }
}

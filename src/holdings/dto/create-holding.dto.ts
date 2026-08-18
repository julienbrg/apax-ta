import { UserDto } from '../../users/dto/user.dto';
import { AssetTypeEnum } from '../asset-type.enum';

import {
  // decorators here
  IsEnum,
  IsPositive,
  IsNumber,
} from 'class-validator';

import {
  // decorators here
  ApiProperty,
} from '@nestjs/swagger';

export class CreateHoldingDto {
  user?: UserDto;

  @ApiProperty({
    required: true,
    type: () => Number,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    required: true,
    enum: AssetTypeEnum,
  })
  @IsEnum(AssetTypeEnum)
  assetType: AssetTypeEnum;

  // Don't forget to use the class-validator decorators in the DTO properties.
}

import { User } from '../../users/domain/user';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AssetTypeEnum } from '../asset-type.enum';

export class Holding {
  @Exclude({ toPlainOnly: true })
  user?: User;

  @ApiProperty({
    type: () => Number,
    nullable: false,
  })
  amount: number;

  @ApiProperty({
    enum: AssetTypeEnum,
    nullable: false,
  })
  assetType: AssetTypeEnum;

  @ApiProperty({
    type: String,
  })
  id: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

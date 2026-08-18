import { ApiProperty } from '@nestjs/swagger';
import { AssetTypeEnum } from '../asset-type.enum';

export class PortfolioAssetDto {
  @ApiProperty({ type: () => Number })
  amount: number;

  @ApiProperty({ type: () => Date, nullable: true })
  updatedAt: Date | null;
}

export class PortfolioDto implements Record<AssetTypeEnum, PortfolioAssetDto> {
  @ApiProperty({ type: () => PortfolioAssetDto })
  gold: PortfolioAssetDto;

  @ApiProperty({ type: () => PortfolioAssetDto })
  silver: PortfolioAssetDto;

  @ApiProperty({ type: () => PortfolioAssetDto })
  platinum: PortfolioAssetDto;
}

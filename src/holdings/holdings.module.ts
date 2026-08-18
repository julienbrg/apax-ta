import { UsersModule } from '../users/users.module';
import {
  // do not remove this comment
  Module,
} from '@nestjs/common';
import { HoldingsService } from './holdings.service';
import { HoldingsController } from './holdings.controller';
import { DocumentHoldingPersistenceModule } from './infrastructure/persistence/document/document-persistence.module';

@Module({
  imports: [
    UsersModule,

    // do not remove this comment
    DocumentHoldingPersistenceModule,
  ],
  controllers: [HoldingsController],
  providers: [HoldingsService],
  exports: [HoldingsService, DocumentHoldingPersistenceModule],
})
export class HoldingsModule {}

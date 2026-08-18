import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HoldingSchema, HoldingSchemaClass } from './entities/holding.schema';
import { HoldingRepository } from '../holding.repository';
import { HoldingDocumentRepository } from './repositories/holding.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HoldingSchemaClass.name, schema: HoldingSchema },
    ]),
  ],
  providers: [
    {
      provide: HoldingRepository,
      useClass: HoldingDocumentRepository,
    },
  ],
  exports: [HoldingRepository],
})
export class DocumentHoldingPersistenceModule {}

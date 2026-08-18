import { Holding } from '../../../../domain/holding';

import { User } from '../../../../../users/domain/user';

import { HoldingSchemaClass } from '../entities/holding.schema';

export class HoldingMapper {
  public static toDomain(raw: HoldingSchemaClass): Holding {
    const domainEntity = new Holding();
    if (raw.user) {
      const userDomain = new User();
      userDomain.id = raw.user.toString();
      domainEntity.user = userDomain;
    }

    domainEntity.amount = raw.amount;

    domainEntity.assetType = raw.assetType;

    domainEntity.id = raw._id.toString();
    domainEntity.createdAt = raw.createdAt;
    domainEntity.updatedAt = raw.updatedAt;

    return domainEntity;
  }

  public static toPersistence(domainEntity: Holding): HoldingSchemaClass {
    const persistenceSchema = new HoldingSchemaClass();
    if (domainEntity.user) {
      persistenceSchema.user = domainEntity.user.id.toString();
    }

    persistenceSchema.amount = domainEntity.amount;

    persistenceSchema.assetType = domainEntity.assetType;

    if (domainEntity.id) {
      persistenceSchema._id = domainEntity.id;
    }
    persistenceSchema.createdAt = domainEntity.createdAt;
    persistenceSchema.updatedAt = domainEntity.updatedAt;

    return persistenceSchema;
  }
}

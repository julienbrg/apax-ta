import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Holding } from '../../domain/holding';
import { User } from '../../../users/domain/user';

export abstract class HoldingRepository {
  abstract create(
    data: Omit<Holding, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Holding>;

  abstract findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Holding[]>;

  abstract findById(id: Holding['id']): Promise<NullableType<Holding>>;

  abstract findByIds(ids: Holding['id'][]): Promise<Holding[]>;

  abstract findByUserId(userId: User['id']): Promise<Holding[]>;

  abstract update(
    id: Holding['id'],
    payload: DeepPartial<Holding>,
  ): Promise<Holding | null>;

  abstract remove(id: Holding['id']): Promise<void>;
}

import { Injectable } from '@nestjs/common';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HoldingSchemaClass } from '../entities/holding.schema';
import { HoldingRepository } from '../../holding.repository';
import { Holding } from '../../../../domain/holding';
import { HoldingMapper } from '../mappers/holding.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { User } from '../../../../../users/domain/user';

@Injectable()
export class HoldingDocumentRepository implements HoldingRepository {
  constructor(
    @InjectModel(HoldingSchemaClass.name)
    private readonly holdingModel: Model<HoldingSchemaClass>,
  ) {}

  async create(data: Holding): Promise<Holding> {
    const persistenceModel = HoldingMapper.toPersistence(data);
    const createdEntity = new this.holdingModel(persistenceModel);
    const entityObject = await createdEntity.save();
    return HoldingMapper.toDomain(entityObject);
  }

  async findAllWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Holding[]> {
    const entityObjects = await this.holdingModel
      .find()
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .limit(paginationOptions.limit);

    return entityObjects.map((entityObject) =>
      HoldingMapper.toDomain(entityObject),
    );
  }

  async findById(id: Holding['id']): Promise<NullableType<Holding>> {
    const entityObject = await this.holdingModel.findById(id);
    return entityObject ? HoldingMapper.toDomain(entityObject) : null;
  }

  async findByIds(ids: Holding['id'][]): Promise<Holding[]> {
    const entityObjects = await this.holdingModel.find({ _id: { $in: ids } });
    return entityObjects.map((entityObject) =>
      HoldingMapper.toDomain(entityObject),
    );
  }

  async findByUserId(userId: User['id']): Promise<Holding[]> {
    const entityObjects = await this.holdingModel.find({
      user: userId.toString(),
    });
    return entityObjects.map((entityObject) =>
      HoldingMapper.toDomain(entityObject),
    );
  }

  async update(
    id: Holding['id'],
    payload: Partial<Holding>,
  ): Promise<NullableType<Holding>> {
    const clonedPayload = { ...payload };
    delete clonedPayload.id;

    const filter = { _id: id.toString() };
    const entity = await this.holdingModel.findOne(filter);

    if (!entity) {
      throw new Error('Record not found');
    }

    const entityObject = await this.holdingModel.findOneAndUpdate(
      filter,
      HoldingMapper.toPersistence({
        ...HoldingMapper.toDomain(entity),
        ...clonedPayload,
      }),
      { new: true },
    );

    return entityObject ? HoldingMapper.toDomain(entityObject) : null;
  }

  async remove(id: Holding['id']): Promise<void> {
    await this.holdingModel.deleteOne({ _id: id });
  }
}

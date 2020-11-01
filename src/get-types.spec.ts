import 'reflect-metadata';
import {
  Arg,
  buildSchema,
  Field,
  getMetadataStorage,
  Int,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { ArgParamMetadata } from 'type-graphql/dist/metadata/definitions';
import { getOutputType } from './get-types';
import { metadata } from './metadata';

describe('getTypes ', () => {
  beforeAll(async () => {
    getMetadataStorage().clear();

    @ObjectType()
    class SampleObject {
      @Field(() => Int)
      temp: number;

      constructor(i: number) {
        this.temp = i;
      }
    }

    @Resolver()
    class SampleResolver {
      @Query(() => SampleObject)
      normalQuery(
        @Arg('arg', () => Int, { nullable: true }) i: number
      ): SampleObject {
        return new SampleObject(i);
      }
    }

    await buildSchema({
      resolvers: [SampleResolver],
    });
  });

  it('getOutputType', () => {
    const text = getOutputType(
      metadata.queries[0].getReturnType(),
      metadata.queries[0].returnTypeOptions
    );

    expect(text).toBe('SampleObject!');
  });

  it('getArgType', () => {
    const arg = metadata.queries[0].params?.[0] as ArgParamMetadata;
    const text = getOutputType(arg.getType(), arg.typeOptions);

    expect(text).toBe('Int');
  });
});

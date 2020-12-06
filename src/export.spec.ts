import 'reflect-metadata';
import {
  Arg,
  Args,
  ArgsType,
  buildSchema,
  Field,
  Float,
  getMetadataStorage,
  ID,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from 'type-graphql';
import { APIExport, exportAPI } from './export';

describe('exportAPI  ', () => {
  beforeAll(async () => {
    getMetadataStorage().clear();

    @ObjectType()
    class SampleObject {
      @Field(() => Int)
      temp: number;

      constructor(temp: number) {
        this.temp = temp;
      }
    }

    @ArgsType()
    class SampleArg {
      @Field(() => Float)
      foo?: number;

      @Field(() => ID, { nullable: true, description: 'arg desc' })
      bar?: number;
    }

    @InputType()
    class SampleInput {
      @Field(() => Float, { description: 'input desc' })
      temp = 0;
    }

    @Resolver()
    class SampleResolver {
      @Query(() => SampleObject, { description: 'query desc' })
      normalQuery(@Args() args: SampleArg): SampleObject {
        return new SampleObject(args.bar || 0);
      }

      @Mutation(() => [SampleObject], {
        nullable: 'itemsAndList',
        description: 'mutation desc',
        deprecationReason: 'deprecated',
      })
      normalMutation(@Arg('input') input: SampleInput) {
        return [new SampleObject(input.temp)];
      }
    }

    await buildSchema({
      resolvers: [SampleResolver],
    });
  });

  it('query ', () => {
    const query = exportAPI(getMetadataStorage().queries);
    const expectedQuery: APIExport = {
      name: 'normalQuery',
      outputType: 'SampleObject!',
      description: 'query desc',
      args: [
        {
          name: 'foo',
          description: '',
          type: 'Float!',
        },
        {
          name: 'bar',
          description: 'arg desc',
          type: 'ID',
        },
      ],
      deprecatedReason: '',
    };

    expect(query).toEqual([expectedQuery]);
  });

  it('mutation', () => {
    const mutation = exportAPI(getMetadataStorage().mutations);
    const expectedMutation: APIExport = {
      name: 'normalMutation',
      outputType: '[SampleObject]',
      description: 'mutation desc',
      args: [
        {
          name: 'temp',
          description: 'input desc',
          type: 'Float',
        },
      ],
      deprecatedReason: 'deprecated',
    };

    expect(mutation).toEqual([expectedMutation]);
  });
});

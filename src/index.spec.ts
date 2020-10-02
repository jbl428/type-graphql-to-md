import 'reflect-metadata';
import { buildSchema, Query, Resolver } from 'type-graphql';
import { getMetadataStorage } from 'type-graphql/dist/metadata/getMetadataStorage';

describe('type-graphql metadata', () => {
  beforeAll(async () => {
    getMetadataStorage().clear();

    @Resolver()
    class SampleResolver {
      @Query()
      normalQuery(): boolean {
        return true;
      }
    }

    await buildSchema({
      resolvers: [SampleResolver],
    });
  });

  it('should get metadata', () => {
    const metadata = getMetadataStorage();

    expect(metadata.queries).toHaveLength(1);
  });
});

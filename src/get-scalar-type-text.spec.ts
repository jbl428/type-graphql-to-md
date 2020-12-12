import { random } from 'faker';
import { GraphQLScalarType } from 'graphql';
import { BuildContext } from 'type-graphql/dist/schema/build-context';

import { getScalaTypeText } from './get-scalar-type-text';

describe('getScalaTypeText ', () => {
  it('GraphQLScalarType', () => {
    const type = new GraphQLScalarType({ name: random.word() });

    expect(getScalaTypeText(type)).toBe(type.name);
  });

  it('ClassType', () => {
    expect(getScalaTypeText(new Number(1))).toBe('Float');

    expect(getScalaTypeText(new String('1'))).toBe('String');

    expect(getScalaTypeText(new Boolean(true))).toBe('Boolean');

    BuildContext.dateScalarMode = 'timestamp';
    expect(getScalaTypeText(new Date())).toBe('GraphQLTimestamp');

    BuildContext.dateScalarMode = 'isoDate';
    expect(getScalaTypeText(new Date())).toBe('GraphQLISODateTime');
  });
});

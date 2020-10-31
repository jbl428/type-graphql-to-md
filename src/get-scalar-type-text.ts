import { GraphQLScalarType } from 'graphql';
import { always, compose, cond, equals, find, ifElse, is, propEq } from 'ramda';
import { isNotEmpty } from 'ramda-adjunct';
import { TypeValue } from 'type-graphql/dist/decorators/types';
import { BuildContext } from 'type-graphql/dist/schema/build-context';

const getScalar = (type: TypeValue): string =>
  find(propEq('type', type), BuildContext.scalarsMaps)?.scalar.name || '';

export const getScalaTypeText = (type: TypeValue): string =>
  cond<TypeValue, string>([
    [is(GraphQLScalarType), always((type as GraphQLScalarType).name)],
    [compose(isNotEmpty, getScalar), getScalar],
    [is(String), always('String')],
    [is(Boolean), always('Boolean')],
    [is(Number), always('Float')],
    [
      is(Date),
      ifElse(
        () => equals('isoDate', BuildContext.dateScalarMode),
        always('GraphQLISODateTime'),
        always('GraphQLTimestamp')
      ),
    ],
  ])(type);

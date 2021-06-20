import { GraphQLScalarType } from 'graphql';
import { always, cond, equals, ifElse, is } from 'ramda';
import { isNotEmpty } from 'ramda-adjunct';
import { TypeValue } from 'type-graphql/dist/decorators/types';
import { BuildContext } from 'type-graphql/dist/schema/build-context';
import { pipe, flow } from 'fp-ts/function';
import { array, option } from 'fp-ts';

const getScalar = (type: TypeValue): string =>
  pipe(
    BuildContext.scalarsMaps,
    array.findFirst((map) => map.type === type),
    option.match(
      () => '',
      (map) => map.scalar.name
    )
  );

export const getScalaTypeText = (type: TypeValue): string =>
  pipe(
    type,
    cond<TypeValue, string>([
      [is(GraphQLScalarType), always((type as GraphQLScalarType).name)],
      [flow(getScalar, isNotEmpty), getScalar],
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
    ])
  );

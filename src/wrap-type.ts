import { and, contains, equals, or, pipe, when } from 'ramda';
import {
  concatRight,
  defaultWhen,
  isFalse,
  isTrue,
  isUndefined,
} from 'ramda-adjunct';
import { TypeOptions } from 'type-graphql/dist/decorators/types';

const isNullableArray = (
  { nullable }: TypeOptions,
  nullableByDefault: boolean
): boolean =>
  or(
    contains(nullable, ['items', 'itemsAndList']),
    and(isUndefined(nullable), isTrue(nullableByDefault))
  );

const wrapTypeInNestedList = (
  name: string,
  depth: number,
  nullable: boolean
): string =>
  depth === 0
    ? name
    : `[${wrapTypeInNestedList(name, depth - 1, nullable)}${
        nullable ? '' : '!'
      }]`;

const isRequiredType = (
  { defaultValue, nullable }: TypeOptions,
  nullableByDefault: boolean
): boolean =>
  and(
    isUndefined(defaultValue),
    or(
      isFalse(nullable),
      or(
        and(isUndefined(nullable), isFalse(nullableByDefault)),
        equals(nullable, 'items')
      )
    )
  );

export const wrapWithTypeOptions = (
  name: string,
  typeOptions: TypeOptions,
  nullableByDefault = false
): string =>
  pipe<string, string>(
    () =>
      defaultWhen(
        () => isTrue(typeOptions.array),
        wrapTypeInNestedList(
          name,
          typeOptions.arrayDepth || 0,
          isNullableArray(typeOptions, nullableByDefault)
        ),
        name
      ),
    when(() => isRequiredType(typeOptions, nullableByDefault), concatRight('!'))
  )();

import { and, contains, or, pipe, prop } from 'ramda';
import { defaultWhen, isTrue, isUndefined } from 'ramda-adjunct';
import { TypeOptions } from 'type-graphql/dist/decorators/types';

const isNullableArray = (
  typeOptions: TypeOptions,
  nullableByDefault: boolean
) =>
  or(
    contains(prop('nullable', typeOptions), ['items', 'itemsAndList']),
    and(isUndefined(prop('nullable', typeOptions)), isTrue(nullableByDefault))
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
    (name) =>
      typeOptions.defaultValue === undefined &&
      (typeOptions.nullable === false ||
        (typeOptions.nullable === undefined && nullableByDefault === false) ||
        typeOptions.nullable === 'items')
        ? name + '!'
        : name
  )();

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

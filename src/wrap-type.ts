import { TypeOptions } from 'type-graphql/dist/decorators/types';

export const wrapWithTypeOptions = (
  name: string,
  typeOptions: TypeOptions,
  nullableByDefault = false
): string => {
  if (typeOptions.array) {
    const isNullableArray =
      typeOptions.nullable === 'items' ||
      typeOptions.nullable === 'itemsAndList' ||
      (typeOptions.nullable === undefined && nullableByDefault === true);

    return wrapTypeInNestedList(
      name,
      typeOptions.arrayDepth || 0,
      isNullableArray
    );
  }

  if (
    typeOptions.defaultValue === undefined &&
    (typeOptions.nullable === false ||
      (typeOptions.nullable === undefined && nullableByDefault === false) ||
      typeOptions.nullable === 'items')
  ) {
    return name + '!';
  }

  return name;
};

function wrapTypeInNestedList(
  name: string,
  depth: number,
  nullable: boolean
): string {
  if (depth === 0) {
    return name;
  }

  return `[${wrapTypeInNestedList(name, depth - 1, nullable)}]${
    nullable ? '' : '!'
  }`;
}

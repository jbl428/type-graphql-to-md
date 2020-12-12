import { pipe, prop } from 'ramda';
import { TypeOptions, TypeValue } from 'type-graphql/dist/decorators/types';
import { BuildContext } from 'type-graphql/dist/schema/build-context';

import { getScalaTypeText } from './get-scalar-type-text';
import { metadata } from './metadata';
import { wrapWithTypeOptions } from './wrap-type';

const makePredicate = (type: TypeValue) => <T>(name: keyof T) => (obj: T) =>
  (obj[name] as unknown) === type;

const getOtherOutputType: (type: TypeValue) => string = pipe(
  makePredicate,
  (predicate): { name: string } =>
    metadata.objectTypes.find(predicate('target')) ||
    metadata.interfaceTypes.find(predicate('target')) ||
    metadata.enums.find(predicate('enumObj')) ||
    metadata.unions.find(predicate('symbol')) || { name: '' },
  prop('name')
);

export const getOutputType = (
  type: TypeValue,
  typeOptions: TypeOptions
): string =>
  wrapWithTypeOptions(
    getScalaTypeText(type) || getOtherOutputType(type),
    typeOptions,
    BuildContext.nullableByDefault
  );

const getOtherArgType: (type: TypeValue) => string = pipe(
  makePredicate,
  (predicate): { name: string } =>
    metadata.inputTypes.find(predicate('target')) ||
    metadata.enums.find(predicate('enumObj')) || { name: '' },
  prop('name')
);

export const getArgType = (type: TypeValue, typeOptions: TypeOptions): string =>
  wrapWithTypeOptions(
    getScalaTypeText(type) || getOtherArgType(type),
    typeOptions,
    BuildContext.nullableByDefault
  );

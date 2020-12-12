import { chain, filter, find, map, pipe } from 'ramda';
import {
  ArgParamMetadata,
  ArgsParamMetadata,
  ClassMetadata,
  FieldMetadata,
  ParamMetadata,
  ResolverMetadata,
} from 'type-graphql/dist/metadata/definitions';

import { getArgType, getOutputType } from './get-types';
import { metadata } from './metadata';

export interface APIExport {
  name: string;
  outputType: string;
  description: string;
  args: ArgExport[];
  deprecatedReason: string;
}

interface ArgExport {
  name: string;
  type: string;
  description: string;
}

export const exportAPI = pipe(
  filter<ResolverMetadata, 'array'>(
    (handler) => !handler.resolverClassMetadata?.isAbstract
  ),
  map<ResolverMetadata, APIExport>((handler) => ({
    name: handler.schemaName,
    outputType: getOutputType(
      handler.getReturnType(),
      handler.returnTypeOptions
    ),
    description: handler.description || '',
    args: getArgExports(handler.params || []),
    deprecatedReason: handler.deprecationReason || '',
  }))
);

export const getArgExports = chain<ParamMetadata, ArgExport>((param) =>
  param.kind === 'arg'
    ? fromArgParamMetadata(param)
    : param.kind === 'args'
    ? fromArgsParamMetadata(param)
    : []
);

const fromArgParamMetadata = (param: ArgParamMetadata): ArgExport[] =>
  pipe(
    () =>
      find<ClassMetadata>(
        (inputType) => inputType.target === param.getType(),
        metadata.inputTypes
      ),
    (inputType) =>
      inputType?.fields
        ? map(
            (field) => ({
              name: field.name,
              type: getArgType(field.getType(), field.typeOptions),
              description: field.description || '',
            }),
            inputType.fields
          )
        : [
            {
              name: param.name,
              type: getArgType(param.getType(), param.typeOptions),
              description: param.description || '',
            },
          ]
  )();

const fromArgsParamMetadata = (param: ArgsParamMetadata): ArgExport[] =>
  pipe(
    () =>
      find<ClassMetadata>(
        (it) => it.target === param.getType(),
        metadata.argumentTypes
      ),
    (argType) => argType?.fields || [],
    map<FieldMetadata, ArgExport>((field) => ({
      name: field.name,
      type: getArgType(field.getType(), field.typeOptions),
      description: field.description || '',
    }))
  )();

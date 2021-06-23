import {
  ArgParamMetadata,
  ArgsParamMetadata,
  ParamMetadata,
  ResolverMetadata,
} from 'type-graphql/dist/metadata/definitions';
import { pipe } from 'fp-ts/function';
import { array, option, readonlyArray } from 'fp-ts';
import { chain } from 'ramda';

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

export const exportAPI = (
  metadata: readonly ResolverMetadata[]
): readonly APIExport[] =>
  pipe(
    metadata,
    readonlyArray.filter(
      (handler) => !handler.resolverClassMetadata?.isAbstract
    ),
    readonlyArray.map((handler) => ({
      name: handler.schemaName,
      outputType: getOutputType(
        handler.getReturnType(),
        handler.returnTypeOptions
      ),
      description: handler.description || '',
      args: getArgExports(handler.params),
      deprecatedReason: handler.deprecationReason || '',
    }))
  );

export const getArgExports = (arg?: ParamMetadata[]): ArgExport[] =>
  pipe(
    option.fromNullable(arg),
    option.map(
      chain((param) =>
        param.kind === 'arg'
          ? fromArgParamMetadata(param)
          : param.kind === 'args'
          ? fromArgsParamMetadata(param)
          : []
      )
    ),
    option.getOrElse(() => [] as ArgExport[])
  );

const fromArgsParamMetadata = (param: ArgsParamMetadata): ArgExport[] =>
  pipe(
    metadata.argumentTypes,
    array.findFirst((it) => it.target === param.getType()),
    option.chainNullableK((argType) => argType.fields),
    option.match(
      () => [],
      array.map((field) => ({
        name: field.name,
        type: getArgType(field.getType(), field.typeOptions),
        description: field.description || '',
      }))
    )
  );

const fromArgParamMetadata = (param: ArgParamMetadata): readonly ArgExport[] =>
  pipe(
    metadata.inputTypes,
    array.findFirst((inputType) => inputType.target === param.getType()),
    option.chainNullableK((inputType) => inputType.fields),
    option.match(
      () => [
        {
          name: param.name,
          type: getArgType(param.getType(), param.typeOptions),
          description: param.description || '',
        },
      ],
      array.map((field) => ({
        name: field.name,
        type: getArgType(field.getType(), field.typeOptions),
        description: field.description || '',
      }))
    )
  );

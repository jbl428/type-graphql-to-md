import { promises } from 'fs';
import json2md from 'json2md';
import { tuple, taskEither, array, option } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { log } from 'fp-ts/Console';
import { fromPredicate } from 'fp-ts/Option';
import { isEmpty } from 'fp-ts/Array';
import { concat } from 'ramda';

import { APIExport, exportAPI } from './export';
import { metadata } from './metadata';

export const exportToMarkdown = (
  title: string,
  fileName: string
): Promise<void> =>
  pipe(
    taskEither.fromTask(() => promises.open(fileName, 'w')),
    taskEither.map((file) =>
      file.write(makeMarkdown(title)).then(() => file.close())
    ),
    taskEither.match(log('failed to generate'), log(`${fileName} generated`))
  )();

const makeMarkdown = (title: string): string =>
  pipe(
    [metadata.queries, metadata.mutations],
    tuple.bimap(exportAPI, exportAPI),
    ([queryResult, mutationResult]): json2md.DataObject[] => [
      { h1: title },
      { h2: 'Query' },
      {
        ul: queryResult.map((q) =>
          json2md({
            link: { title: q.name, source: '#' + q.name.toLowerCase() },
          })
        ),
      },
      { h2: 'Mutation' },
      {
        ul: mutationResult.map((m) =>
          json2md({
            link: { title: m.name, source: '#' + m.name.toLowerCase() },
          })
        ),
      },
      ...queryResult.flatMap(apiToMd),
      ...mutationResult.flatMap(apiToMd),
    ],
    json2md
  );

const apiToMd = (api: APIExport): json2md.DataObject[] => [
  { h2: api.name },
  {
    ul: array.compact([
      option.of('output type: ' + api.outputType),
      option.of('description: ' + api.description),
      pipe(
        api.deprecatedReason,
        fromPredicate((reason) => !!reason),
        option.map(concat('deprecated: '))
      ),
      isEmpty(api.args) ? option.none : option.of('arguments'),
    ]),
  },
  isEmpty(api.args)
    ? []
    : [
        {
          table: {
            headers: Object.keys(api.args[0]),
            rows: api.args.map(({ name, type, description }) => ({
              name,
              type,
              description,
            })),
          },
        },
      ],
];

import { promises } from 'fs';
import json2md from 'json2md';
import { tuple, taskEither } from 'fp-ts';
import { pipe } from 'fp-ts/function';
import { log } from 'fp-ts/Console';

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

const apiToMd = (api: APIExport): json2md.DataObject[] => {
  const objects: json2md.DataObject[] = [
    { h2: api.name },
    {
      ul: ['output type: ' + api.outputType, 'description: ' + api.description],
    },
  ];

  if (api.deprecatedReason) {
    objects[1].ul?.push('deprecated: ' + api.deprecatedReason);
  }

  if (api.args.length > 0) {
    objects[1].ul?.push('arguments');
    objects.push({
      table: {
        headers: Object.keys(api.args[0]),
        rows: api.args.map(({ name, type, description }) => ({
          name,
          type,
          description,
        })),
      },
    });
  }

  return objects;
};

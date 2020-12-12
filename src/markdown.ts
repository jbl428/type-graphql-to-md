import { promises } from 'fs';
import json2md from 'json2md';

import { APIExport, exportAPI } from './export';
import { metadata } from './metadata';

export const exportToMarkdown = async (
  title: string,
  fileName: string
): Promise<void> => {
  const { queries, mutations } = metadata;
  const queryResult = exportAPI(queries);
  const mutationResult = exportAPI(mutations);

  const markdown = json2md([
    { h1: title },
    { h2: 'Query' },
    {
      ul: queryResult.map((q) =>
        json2md({ link: { title: q.name, source: '#' + q.name.toLowerCase() } })
      ),
    },
    { h2: 'Mutation' },
    {
      ul: mutationResult.map((m) =>
        json2md({ link: { title: m.name, source: '#' + m.name.toLowerCase() } })
      ),
    },
    queryResult.map((q) => apiToMd(q)),
    mutationResult.map((m) => apiToMd(m)),
  ]);

  const file = await promises.open(fileName, 'w');
  await file.write(markdown);
  await file.close();

  console.log(`${fileName} created`);
};

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

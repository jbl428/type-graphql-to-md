# type-graphql-to-md

[![npm version](https://badge.fury.io/js/type-graphql-to-md.svg)](https://badge.fury.io/js/type-graphql-to-md)
![action workflow](https://github.com/jbl428/type-graphql-to-md/actions/workflows/node.yml/badge.svg)

Make a markdown file for type-graphql spec

## Requirement

- TypeGraphQL

## Example

Refer `src/markdown.spec.ts`

```typescript
import { buildSchema } from 'type-graphql';

// you should call buildSchema function from type-graphql first
await buildSchema({ resolvers: [SampleResolver], });
await exportToMarkdown('API Spec', 'spec.md');
```

## Test

```sh
yarn test
```

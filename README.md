# type-graphql-to-md

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

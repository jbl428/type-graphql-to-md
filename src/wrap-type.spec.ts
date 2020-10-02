import { random } from 'faker';

import { wrapWithTypeOptions } from './wrap-type';

describe('wrapWithTypeOptions', () => {
  const typeName = random.word();

  it('empty type option', () => {
    const actual = wrapWithTypeOptions(typeName, {});

    expect(actual).toBe(typeName + '!');
  });

  it('nullable item', () => {
    const actual = wrapWithTypeOptions(typeName, { nullable: true });

    expect(actual).toBe(typeName);
  });

  it('required item', () => {
    const actual = wrapWithTypeOptions(typeName, { nullable: false });

    expect(actual).toBe(typeName + '!');
  });

  it('nullable array and item', () => {
    const actual = wrapWithTypeOptions(typeName, {
      nullable: 'itemsAndList',
      array: true,
      arrayDepth: 1,
    });

    expect(actual).toBe(`[${typeName}]`);
  });

  it('required array and item', () => {
    const actual = wrapWithTypeOptions(typeName, {
      nullable: false,
      array: true,
      arrayDepth: 1,
    });

    expect(actual).toBe(`[${typeName}!]!`);
  });
});

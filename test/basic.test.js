import {expect, test} from '@jest/globals';
import {oneLine} from 'common-tags';

test('1 + 1 = 2', () => {
  console.log(
      oneLine`test a comment that\'s over 80 characters, start testing...
              line 2.............................`);
  expect(1 + 1).toBe(2);
});

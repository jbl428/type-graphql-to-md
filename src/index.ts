import { allEqual } from 'ramda-adjunct';

allEqual([1, 2, 3, 4]); //=> false
allEqual([1, 1, 1, 1]); //=> true
allEqual([]); //=> true

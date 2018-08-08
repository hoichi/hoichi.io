import { newDefaultScheduler } from '@most/scheduler';
import {
  filter,
  mergeArray,
  multicast,
  now,
  runEffects,
  tap,
} from '@most/core';
import { Stream } from '@most/types';
import { pipe, identity, complement } from 'ramda';

function slurpWith(f: (s: any) => string, s: Stream<any>) {
  return runEffects(tap(pipe(f, console.log), s), newDefaultScheduler());
}

const slurp = slurpWith.bind(null, identity);

type SplitStreams<T, U> = [Stream<T>, Stream<U>];

function split<T, U extends T, V extends T>(
  filterBy: (T) => boolean,
  input: Stream<T>,
): SplitStreams<U, V> {
  const multi = multicast(input);

  return [
    filter(filterBy, multi),
    filter(complement(filterBy), multi),
  ];
}

function withLog<T>(val: T): T {
  console.log(val);
  return val;
}

export { slurp, slurpWith, split, withLog };

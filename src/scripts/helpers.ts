import { newDefaultScheduler } from '@most/scheduler';
import {filter, mergeArray, multicast, now, runEffects, tap} from '@most/core'
import { Stream } from '@most/types';
import {pipe, identity, complement} from 'ramda'


function fromArray<T>(array: T[]): Stream<T> {
  return mergeArray(array.map(now));
}


function slurpWith(f: (s: any) => string, s: Stream<any>) {
  return runEffects(tap(pipe(f, console.log), s), newDefaultScheduler());
}

const slurp = slurpWith.bind(null, identity);

type SplitStreams<T> = [Stream<T>, Stream<T>];

function split<T>(filterBy: (T) => boolean, input: Stream<T>): SplitStreams<T> {
  const multi = multicast(input);

  return [
    filter(filterBy, multi),
    filter(complement(filterBy), multi),
  ]
}


export { fromArray, slurp, slurpWith, split };

import { newDefaultScheduler } from '@most/scheduler';
import { runEffects, tap } from '@most/core';
import { Stream } from '@most/types';
import { pipe, identity } from 'ramda';

function slurpWith(f: (s: any) => string, s: Stream<any>) {
  return runEffects(tap(pipe(f, console.log), s), newDefaultScheduler());
}

const slurp = slurpWith.bind(null, identity);

export { slurp, slurpWith };

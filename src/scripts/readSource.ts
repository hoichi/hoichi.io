import * as chokidar from 'chokidar';
import * as fs from 'graceful-fs';
import * as Path from 'path';
import { Stream } from '@most/types';
import { map, runEffects } from '@most/core';
import { newDefaultScheduler,  currentTime } from '@most/scheduler';
import { fromEvent } from 'most-from-event';

import { FilePath, SourceFile } from './model/page';

function observeSource(globs, options = {}): {fromAdd: Stream<SourceFile>} {
/*
  console.log('cwd = %s', process.cwd());
*/
  const watcher = chokidar.watch(globs, { ...options, persistent: false });

  // be careful to create all the chain synchronously, cause the watcher
  // won’t wait by default
  const fromAdd = map(
    readSourceFile,
    fromEvent('add', watcher)
  );
  // const fromAdd = fromGlob('add', globs, options);

  const fromAddWithLog$ = map(event => {
    console.log(event);
    return event;
  }, fromAdd);

  return {
    fromAdd,
    // fromReady$: fromEvent('ready', watcher),
  };
}

function fromGlob(event, globs, options) {
  return new FromEvent(event, globs, options);
}

class FromEvent {
  constructor(
    private event: string,
    private globs: string | string[],
    private options = {},
  ) {}

  run(sink, scheduler) {
    console.log('`run` is running');
    const watcher = chokidar.watch(
      this.globs,
      { ...this.options, persistent: false },
    );
    const send = e => tryEvent(currentTime(scheduler), e, sink);

    watcher.addListener(this.event, send);

    return {
      dispose: () =>
        watcher.removeListener &&
        watcher.removeListener(this.event, send),
      // todo: watcher.close() ?
    };
  }
}

function tryEvent(t, x, sink) {
  try {
    sink.event(t, x);
  } catch (e) {
    sink.error(t, e);
  }
}

/**
 * @param path
 * @param {string} cwd
 * @returns {SourceFile}
 */
function readSourceFile(path: string, cwd = '.', ): SourceFile | null {
  const parsedPath = parsePath(path),
    page: SourceFile = {
      path: parsedPath,
      content: '',
    };

  const xCwd = process.cwd(),
    changeDirs = xCwd !== cwd;

  try {
    changeDirs && process.chdir(cwd);
    // fixme: always pass _some_ encoding here, but don’t hardcode it
    page.content = fs.readFileSync(path, 'utf-8');
  } finally {
    changeDirs && process.chdir(xCwd);
  }

  return page;
}

function parsePath(path: string): FilePath {
  const sep = Path.sep,
    { dir, ext, name } = Path.parse(path),
    dirs = dir.split(sep);

  return {
    dir,
    dirs,
    ext,
    name,
    full: path,
  };
}

export { observeSource };

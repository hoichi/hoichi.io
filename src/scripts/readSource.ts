import * as chokidar from 'chokidar';
import * as fs from 'graceful-fs';
import * as Path from 'path';
// import { map, runEffects } from '@most/core';
import { /*newDefaultScheduler, */ currentTime } from '@most/scheduler';
import { FilePath, SourceFile } from './model/page';

function observeSource(globs, options = {}) {
  console.log('cwd = %s', process.cwd());
  const watcher = chokidar.watch(globs, { ...options, persistent: false });

  const fromAdd$ = fromEvent('add', watcher);

/*
  const fromAddWithLog$ = map(event => {
    console.log(event);
    return event;
  }, fromAdd$);

  runEffects(fromAddWithLog$, newDefaultScheduler())
    .then(() => console.log('My job here is done'))
    .catch(err => console.log(err));
*/

  return {
    fromAdd$,
    fromReady$: fromEvent('ready', watcher),
  };
}

// fromEvent :: (EventTarget t, Event e) =>
// String -> t -> boolean=false -> Stream e
const fromEvent = (event, node, capture = false) =>
  new FromEvent(event, node, capture);

class FromEvent {
  constructor(
    private event: string,
    private node: Record<string, any>,
    private capture: boolean = false,
  ) {}

  run(sink, scheduler) {
    const send = e => tryEvent(currentTime(scheduler), e, sink);

    this.node.addListener &&
      this.node.addListener(this.event, send, this.capture);

    return {
      dispose: () =>
        this.node.removeListener &&
        this.node.removeListener(this.event, send, this.capture),
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
function readSourceFile(cwd = '.', path: string): SourceFile | null {
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
    path,
  };
}

export { observeSource };

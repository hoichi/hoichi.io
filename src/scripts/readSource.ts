import { watch, WatchOptions } from 'chokidar';
import * as fs from 'graceful-fs';
import * as Path from 'path';
import { Stream } from '@most/types';
import { map, until } from '@most/core';
import { fromEvent } from 'most-from-event';

import { FilePath, SourceFile } from './model/page';

function observeSource(globs, options: WatchOptions = {}): Stream<SourceFile> {
/*
  console.log('cwd = %s', process.cwd());
*/
  const watcher = watch(globs, { ...options, persistent: false });

  // be careful to create all the chain synchronously, cause the watcher
  // won’t wait by default
  return until(
    fromEvent('ready', watcher),
    map(readFileInCwd(options.cwd), fromEvent('add', watcher)),
  );
}

function readFileInCwd(cwd = '.') {
  return function readSourceFile(path: string): SourceFile | null {
    const parsedPath = parsePath(path),
      page: SourceFile = {
        path: parsedPath,
        rawContent: '',
      };

    const xCwd = process.cwd(),
      changeDirs = xCwd !== cwd;

    try {
      changeDirs && process.chdir(cwd);
      // fixme: always pass _some_ encoding here, but don’t hardcode it
      page.rawContent = fs.readFileSync(path, 'utf-8');
    } finally {
      changeDirs && process.chdir(xCwd);
    }

    return page;
  }
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

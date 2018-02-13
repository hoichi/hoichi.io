import * as chokidar from 'chokidar';
import * as fs from 'graceful-fs';
import * as Path from 'path';
import { map, runEffects } from '@most/core';
import { domEvent as fromEvent } from '@most/dom-event';
import { newDefaultScheduler } from '@most/scheduler';
import { FilePath, SourceFile } from './model/page';

function observeSource(globs, options = {}) {
    console.log('cwd = %s', process.cwd());
    const watcher = chokidar.watch(globs, {...options, persistent: false});

    // watcher.on('add', event => console.log(event));

    const fromAdd$ = fromEvent('add', watcher);
    const fromAddWithLog$ = map(
      event => {console.log(event); return event},
      fromAdd$,
    );
    runEffects(fromAddWithLog$, newDefaultScheduler())
      .then(() => console.log('My job here is done'))
      .catch((err) => console.log(err));

/*
    const fromAddWithRead$ = map(
        ([path]) => readSourceFile('.', path),
        fromAdd$,
    );
*/

    return {
        fromAdd$/*: fromAddWithRead$*/,
        fromReady$: fromEvent('ready', watcher),
    };
}

/**
 * @param path
 * @param {string} cwd
 * @returns {SourceFile}
 */
function readSourceFile(cwd = '.', path: string): SourceFile | null {
    const
        parsedPath = parsePath(path),
        page: SourceFile = {
            path: parsedPath,
            content: '',
        };

    const
        xCwd = process.cwd(),
        changeDirs = (xCwd !== cwd);

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
    const
        sep = Path.sep,
        {dir, ext, name} = Path.parse(path),
        dirs = dir.split(sep);

    return {
        dir,
        dirs,
        ext,
        name,
        path
    };
}

export { observeSource };
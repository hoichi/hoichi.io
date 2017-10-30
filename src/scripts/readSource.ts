import * as chokidar from 'graceful-chokidar';
import * as fs from 'graceful-fs';
import * as Path from 'path';
import { fromEvent } from 'most';
import { FilePath, SourceFile } from './model/page';

function observeSource(globs, options = {}) {
    // console.log('cwd = %s', process.cwd());
    const watcher = chokidar.watch(globs, options);

    return fromEvent<[string, object]>('add', watcher)
        .map(
            ([path]) => readSourceFile('.', path)
        );
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
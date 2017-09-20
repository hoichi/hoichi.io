import * as chokidar from 'graceful-chokidar';
import * as fs from 'graceful-fs';
import * as Path from 'path';
import { fromEvent } from 'most';
import { FilePath, SourceFile } from './model/page';

function observeSource(globs, options) {
    const watcher = chokidar.watch(globs, options);   // that's not lazy

    return fromEvent('all', watcher)
        .filter(
            ({type}) => type === 'add' || type === 'change'
        )
        .map(console.dir)
    ;
        // .map(readSourceFile);
}

/**
 *
 * @param event
 * @param path
 * @param {string} cwd
 * @returns {SourceFile}
 */
function readSourceFile(event, path, cwd = '.'): SourceFile | null {
    const
        parsedPath = parsePath(path),
        page: SourceFile = {
            path: parsedPath,
            content: '',
        };

    if (event === 'add' || event === 'change') {
        const xCwd = process.cwd();

        try {
            process.chdir(cwd);
            // fixme: always pass _some_ encoding here, but don’t hardcode it
            page.content = fs.readFileSync(path, 'utf-8');
        } finally {
            process.chdir(xCwd);
        }

        return page;
    }

    return null;
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
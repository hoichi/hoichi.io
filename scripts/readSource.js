"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chokidar = require("graceful-chokidar");
const fs = require("graceful-fs");
const Path = require("path");
const most_1 = require("most");
function observeSource(globs, options) {
    const watcher = chokidar.watch(globs, options); // that's not lazy
    return most_1.fromEvent('all', watcher)
        .filter(({ type }) => type === 'add' || type === 'change')
        .map(console.dir);
    // .map(readSourceFile);
}
exports.observeSource = observeSource;
/**
 *
 * @param event
 * @param path
 * @param {string} cwd
 * @returns {SourceFile}
 */
function readSourceFile(event, path, cwd = '.') {
    const parsedPath = parsePath(path), page = {
        path: parsedPath,
        content: '',
    };
    if (event === 'add' || event === 'change') {
        const xCwd = process.cwd();
        try {
            process.chdir(cwd);
            // fixme: always pass _some_ encoding here, but don’t hardcode it
            page.content = fs.readFileSync(path, 'utf-8');
        }
        finally {
            process.chdir(xCwd);
        }
        return page;
    }
    return null;
}
function parsePath(path) {
    const sep = Path.sep, { dir, ext, name } = Path.parse(path), dirs = dir.split(sep);
    return {
        dir,
        dirs,
        ext,
        name,
        path
    };
}
//# sourceMappingURL=readSource.js.map
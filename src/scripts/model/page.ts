/**
 * An abstract source file. Might be a content file, might be, say, a template.
 */
export interface SourceFile {
    path: FilePath;
    content: string;
}

/*
 * Source file path, parsed and ready for any reducing user might request
 * */
export interface FilePath {
    dir: string;
    dirs: string[];
    ext: string;
    name: string;
    path: string;
}

/*
 * Takes a path (and a working dir)
 * returns an object with:
 * - file base (sans extension)
 * - an arr of parent dirs
 * */


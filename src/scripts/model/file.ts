/**
 * What the file writer writes
 */

/**
 * What the blob observer emits. Might be a page, might be a template
 */
interface SourceFile {
  path: FilePath;
  rawContent: string;
}

interface DestinationFile {
  url: string;
  content: string;
}

/*
 * Source file path, parsed and ready for any reductions
 * */
interface FilePath {
  dir: string;
  dirs: string[];
  ext: string;
  name: string;
  full: string;
}

export { SourceFile, DestinationFile, FilePath }

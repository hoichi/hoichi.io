/**
 * What the blob observer emits. Might be a page, might be a template
 */
interface SourceFile {
  path: FilePath;
  rawContent: string;
}

/**
 * Full-blown page, with metadata and content probably converted to html
 */
interface Page extends PageMeta {
  source?: SourceFile;
}

/**
 * What the file writer writes
 */

interface DestinationFile {
  path: string;
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

type PageMeta<T extends {} = {}> = T & {
  title: string;
  date: Date;

  published: boolean;
  category: string;
  tags: string[];

  content: string;
  excerpt: string;
  url: string; // relative to site root
  // [k: string]: any;
};

export { SourceFile, Page, FilePath };

// built into TypeScript 2.9
import {SourceFile} from "./file"

type PropertyKey = string | number | symbol;

/**
 * Full-blown page, with metadata and content probably converted to html
 */
interface Page extends PageMeta {
  id: PropertyKey;
  source?: SourceFile;
}


interface PageMeta {
  title: string;
  date: Date;

  published: boolean;
  category: string;
  tags: string[];

  content: string;
  excerpt: string;
  template?: string;
  url: string; // relative to site root
  // [k: string]: any;
}

export { Page };

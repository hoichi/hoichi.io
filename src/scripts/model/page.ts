// built into TypeScript 2.9
import {SourceFile} from "./file"


type Page = Post | Collection;

/**
 * Full-blown page, with metadata and content probably converted to html
 */
interface Post extends PostMeta {
  kind: 'post';
  id: PropertyKey;
  source?: SourceFile;
}

interface PostMeta {
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

type PropertyKey = string | number | symbol;

interface Collection {
  kind: 'collection';
  key: string;
  title: string;
  posts: ReadonlyArray<Post>;
  // published: boolean; // todo: set it

  content: string;
  template?: string;
  url: string; // relative to site root
}

export { Page, Post, Collection };

import { Stream } from '@most/types';
import { Collection, Page, Post } from './model';
import { SortedList } from './sortedList';
import { chain, map, mergeArray, multicast } from '@most/core';
import { curry2 } from '@most/prelude';
import { fromArray } from 'most-from-array';
import { always, pipe } from 'ramda';
import { exhaustiveCheck } from 'ts-exhaustive-check';

import { split } from './helpers';

interface CollectionOptions {
  collectBy: ((p: Post) => string[]) | string;
  sortBy?: <T>(p: Post) => T;
  uniqueBy?: (p: Post) => string | number | symbol;
  prefill?: Dict<Partial<Collection>>;
  content?: string;
  filter?: (p: Post) => boolean;
  limit?: number;
  template: string;
  url: ((c: Collection) => string) | string;
  [metaKey: string]: any;
}

function collect(
  options: CollectionOptions,
  pages: Stream<Page>,
): Stream<Page> {
  /**
   * Options & conversions thereof
   */
  let {
    collectBy,
    sortBy = p => -(p.date || Date.now()),
    uniqueBy = p => p.id,
    prefill = {},
    content = '',
    filter: filterBy = () => true,
    limit,
    template,
    url,
    ...meta
  } = options;

  const idxFn =
    typeof collectBy === 'string'
      ? pipe(
          always(collectBy),
          Array.of,
        )
      : collectBy;

  const urlFn = typeof url === 'string' ? always(url) : url;

  /**
   * Init the lists
   */
  const dic: Dict<[Collection, SortedList<Post>]> = {};

  // separate pages we collect from the pages we don’t
  const [pagesToCollectSingle, pagesIgnored] = split<Page, Post, Collection>(
    withCollectablesOnly(filterBy),
    pages,
  );
  const pagesToCollect = multicast(pagesToCollectSingle);

  const collections = pipe(
    map(addPage),
    chain(fromArray),
  )(pagesToCollect);

  return mergeArray<Page>([pagesToCollect, pagesIgnored, collections]);

  function addPage(post: Post): Collection[] {
    const result: Collection[] = [];

    const idxs = idxFn(post);

    // add a new list (with prefill)
    // or reference an old one

    for (const idx of idxs) {
      let el = dic[idx];
      const pre = prefill[idx] || {};

      if (!el) {
        el = dic[idx] = [
          {
            kind: 'collection',
            index: idx,
            content: '',
            posts: [],
            template,
            title: pre.title || idx,
            url: '',
            ...pre,
          },
          SortedList<Post>({ sort: sortBy, index: uniqueBy }),
        ];
      }

      const [collection, list] = el;
      collection.posts = list.add(post); // hacky hacky
      collection.url = urlFn(collection);
      result.push(collection);
    }

    return result;
  }
}

/** (Post -> boolean) -> (Page -> Boolean)
 * turns a function that validates Posts into a function that validates
 * pages (and return false for non-collectables)
 */
function withCollectablesOnly(f: (p: Post) => boolean): ((p: Page) => boolean) {
  return (p: Page) => {
    switch (p.kind) {
      case 'collection':
      case 'static':
        return false;
      case 'post':
        return f(p as Post);
      default:
        return exhaustiveCheck(p);
    }
  };
}

const collectCurried = curry2(collect);

export { collectCurried as collect };

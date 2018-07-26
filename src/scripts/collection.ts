import { Stream } from '@most/types';
import { Collection, Page, Post } from './model'
import { SortedList, SortIteratee } from './sortedList';
import {
  chain,
  map,
  mergeArray,
  multicast,
} from '@most/core';
import { curry2 } from '@most/prelude';
import { fromArray } from 'most-from-array';
import { pipe } from 'ramda';
import {exhaustiveCheck} from "ts-exhaustive-check"

import { split } from './helpers';


interface CollectionOptions {
  content?: string;
  filter?: (p: Post) => boolean;
  limit?: number;
  sortBy?: SortIteratee; // todo: generic
  template: string;
  uniqueBy?: SortIteratee;
  url: string;
  [metaKey: string]: any;
}

function collect(
  options: CollectionOptions,
  pages: Stream<Page>,
): Stream<Page> {
  const {
    content = '',
    filter: filterBy = () => true,
    limit,
    sortBy = p => -(p.date || Date.now()),
    template,
    uniqueBy = p => p.id,
    url,
    ...meta
  } = options;

  const list = SortedList<Post>({
    sortBy,
    uniqueBy,
  }); // hack

  const addPage = curry2((list: SortedList<Post>, page: Post) => {
    const pages = list.add(page);

    return {
      pages,
      collection: limit ? list.all.slice(0, limit) : list.all,
    };
  });

  /** (Post -> boolean) -> (Page -> Boolean)
   * turns a function that validates Posts into a function that validates
   * pages (and return false for non-collectables)
   */
  const withCollectablesOnly = (f: (p: Post) => boolean): ((p: Page) => boolean) =>
    (p: Page) => {

      switch (p.kind) {
        case 'collection':
          return false;
        case 'post':
          return f(p as Post);
        default:
          return exhaustiveCheck(p);
      }
    }

  const [ pagesToCollect, pagesIgnored ] = split<Page, Post, Collection>(
    withCollectablesOnly(filterBy),
    pages,
  );

  const collectionState = multicast(map(addPage(list), pagesToCollect));

  const pagesCollected = pipe(map(({ pages }) => pages), chain(fromArray))(
    collectionState,
  );

  const feed = map(
    ({ collection }: { collection: ReadonlyArray<Post> }): Collection => ({
      kind: 'collection',
      key: meta.title,
      title: 'no-title',
      content,
      template,
      url,
      posts: collection,
      ...meta,
    }),
    collectionState,
  );

  return mergeArray([pagesCollected, pagesIgnored, feed]);
}

const collectCurried = curry2(collect);

export { collectCurried as collect };

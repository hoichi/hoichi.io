import { Stream } from '@most/types';
import { Page } from './model/page';
import { SortedList, SortIteratee } from './sortedList';
import {
  chain,
  filter,
  map,
  mergeArray,
  multicast,
  now,
  tap,
} from '@most/core';
import { curry2 } from '@most/prelude';
import { pipe } from 'ramda';
import { fromArray } from 'most-from-array';

import { split } from './helpers';


interface CollectionOptions {
  content?: string;
  filter?: (p: Page) => boolean;
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

  const list = SortedList<Page>({
    sortBy,
    uniqueBy,
  }); // hack

  const addPage = curry2((list: SortedList<Page>, page: Page) => {
    const pages = list.add(page);

    return {
      pages,
      collection: limit ? list.all.slice(0, limit) : list.all,
    };
  });

  const [ pagesToCollect, pagesIgnored ] = split(
    filterBy,
    pages,
  );

  const collectionState = multicast(map(addPage(list), pagesToCollect));

  const pagesCollected = pipe(map(({ pages }) => pages), chain(fromArray))(
    collectionState,
  );

  const feed = map(
    ({ collection: posts }) => ({
      content,
      template,
      url,
      posts,
      ...meta,
    }),
    collectionState,
  );

  return mergeArray([pagesCollected, pagesIgnored, feed]);
}

const collectCurried = curry2(collect);

export { collectCurried as collect };

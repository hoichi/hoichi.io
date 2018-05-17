import {Stream} from "@most/types"
import {Page} from "./model/page"
import { SortedList, SortIteratee } from "./sortedList"
import {chain, filter, map, mergeArray, multicast, now} from "@most/core"
import {curry2} from "@most/prelude"
import {pipe} from "ramda"
import {fromArray} from "./helpers"

interface CollectionOptions {
  sortBy?: SortIteratee;
  indexBy?: SortIteratee;
}

function collect(options: {/* todo */}, pages: Stream<Page>): Stream<Page> {
  const list = SortedList<Page>({ // todo: to options
    sortBy: p => -(p.date || Date.now()),
    indexBy: p => p.id,
  }); // hack

  list.sort();

  const addPage = curry2((list: SortedList<Page>, page: Page) => {
    const pages = list.add(page);

    return {
      pages,
      collection: list.all,
    };
  });

  // todo: extract to helpers
  const pagesToFilter = multicast(pages);
  const pagesToCollect = filter(
    (p: Page) => p.category === 'blog', // todo: to options
    pagesToFilter,
  );
  const pagesIgnored = filter(
    (p: Page) => p.category !== 'blog', // todo: to options
    pagesToFilter,
  );

  const collectionState = multicast(map(addPage(list), pagesToCollect));

  const pagesCollected = pipe(map(({ pages }) => pages), chain(fromArray))(
    collectionState,
  );

  const blogFeed = map(
    ({ collection: posts }) => ({
      // todo: to options
      category: 'blog',
      template: 'blog',
      short_desc: 'You won’t believe what this developer didn’t know',
      url: '',
      posts,
    }),
    collectionState,
  );

  return mergeArray([pagesCollected, pagesIgnored, blogFeed]);
}

const collectCurried = curry2(collect);

export { collectCurried as collect }

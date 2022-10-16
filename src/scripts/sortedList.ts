/**
 * Created by hoichi on 18.01.2017.
 */
import { sortBy } from 'ramda';

export interface SortedList<T> {
  add(T): ReadonlyArray<T>;
  all: ReadonlyArray<T>;
}

interface SLOptions<T> {
  debug?: boolean;
  limit?: number;
  index: SortIteratee;
  sort: SortIteratee;
}

type SortValue = string | number;
export type SortIteratee = (el: any) => SortValue;

/*
 * What does it do
 * - adds value
 * - sorts values on demand
 * - reports length
 * - returns all
 * */

export function SortedList<T>(options: SLOptions<T>): SortedList<T> {
  const _dic = Object.create(null);
  let _list: T[] = [];

  /* options defaults */
  let _options = {
    debug: false,
    index: options.index || ((el) => el.toString()),
    sort: options.sort || options.index || ((el) => el.toString()),
    ...options,
  };

  /**
   * Adds an item and returns whatever we’re ready to return
   * @param item
   * @returns {any}
   */
  function add(item: T) {
    const id = _options.index(item);
    _dic[id] = item;

    // fix it someday
    _sort();

    return Object.freeze(_list);
  }

  /**
   * Sorts and returns the whole `all`.
   * @returns {ReadonlyArray<T>}
   */
  function _sort() {
    _list = sortBy(
      _options.sort,
      Object.keys(_dic).map((k) => _dic[k]),
    );
  }

  let api: SortedList<T> = {
    get all() {
      return Object.freeze(_list);
    },
    add,
  };

  return Object.freeze(api);
}

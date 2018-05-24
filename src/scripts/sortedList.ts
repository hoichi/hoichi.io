/**
 * Created by hoichi on 18.01.2017.
 */
// import {sortedLastIndexBy, sortBy} from 'lodash'; // todo: ramda?

import { sortBy, findIndex } from 'ramda';

export interface SortedList<T> {
  add(T): ReadonlyArray<T>;
  all: ReadonlyArray<T>;
  __4tests__?: SLPrivateFunctions<T>;
}

interface SLPrivateFunctions<T> {
  addSorted(T): ReadonlyArray<T>;
  meetTheNeighbors(number, T): ReadonlyArray<T>;
  setPrevNext(a: T, b: T): [T, T];
}

interface SLOptions<T> {
  debug?: boolean;
  limit?: number;
  uniqueBy?: SortIteratee;
  sortBy?: SortIteratee;
  setPrev?: PrevNextSetter<T>;
  setNext?: PrevNextSetter<T>;
  unique?: boolean;
}

type SortValue = string | number;
export type SortIteratee = (el: any) => SortValue;
type PrevNextSetter<T> = (target: T, other: T) => T;

/*
* What does it do
* - adds value
* - sorts values on demand
* - reports length
* - returns all
* */

export function SortedList<T>(options: SLOptions<T> = {}): SortedList<T> {
  let _isSorted = true,
    _dic = Object.create(null),
    _list: T[] = [];

  function PrevNextNoOp(target: T, other: T) {
    return target;
  }

  /* options defaults */
  let _options = {
    debug: false,
    uniqueBy: options.sortBy || (el => el.toString()),
    setNext: PrevNextNoOp,
    setPrev: PrevNextNoOp,
    sortBy: options.uniqueBy || (el => el.toString()),
    unique: true,
    ...options,
  };

  /**
   * Adds an item and returns whatever we’re ready to return
   * @param item
   * @returns {any}
   */
  function add(item: T) {
    const id = _options.uniqueBy(item);
    _dic[id] = item;

    _sort();

    return addSorted(item);
  }

  /**
   * Insert an item in a sorted position, returns every item mutated in the process
   * @param item
   * @returns {Array}
   */
  function addSorted(item: T) {
    if (!_isSorted)
      throw Error('Did someone just call `addSorted()` on an unsorted all?');

    let { sortBy } = _options,
      idx = findIndex(el => sortBy(el) === sortBy(item), _list);

    // ~~mutate and~~ return the item and its neighbors
    return meetTheNeighbors(idx, item);
  }

  /**
   * For now it just returns an array of an item and its neighbors
   * @param idx
   * @param curr
   * @returns {ReadonlyArray<T>}
   */
  function meetTheNeighbors(idx: number, curr: T) {
    let idxPrev = idx - 1,
      idxNext = idx + 1,
      result: T[] = [];

    if (idxPrev >= 0) {
      result.push(_list[idxPrev]);
    }

    result.push(curr);

    if (idxNext < _list.length) {
      result.push(_list[idxNext]);
    }

    return Object.freeze(result);
  }

  /**
   * Sets a next element link on the previous one and vice versa
   * @param first
   * @param second
   * @returns {[T|any,T|any]}
   */
  function setPrevNext(first: T, second: T): [T, T] {
    return [_options.setNext(first, second), _options.setPrev(second, first)];
  }

  /**
   * Sorts and returns the whole `all`.
   * @returns {ReadonlyArray<T>}
   */
  function _sort() {
    _list = sortBy(_options.sortBy, Object.keys(_dic).map(k => _dic[k]));

    // and now the fun part: setting prev/next on the whole all
    let len = _list.length;

    for (let i = 0; i < len - 1; i++) {
      let [first, second] = setPrevNext(_list[i], _list[i + 1]);
      _list[i] = first; // hack: we do these assignments twice per item
      _list[i + 1] = second; // hack: we do these assignments twice per item
    }
  }

  let api: SortedList<T> = {
    get all() {
      return Object.freeze(_list);
    },
    add,
  };

  if (_options.debug) {
    api.__4tests__ = {
      addSorted,
      meetTheNeighbors,
      setPrevNext,
    };
  }
  return Object.freeze(api);
}

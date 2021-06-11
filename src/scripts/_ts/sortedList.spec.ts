import {SortedList } from "./sortedList";

test('insert sorted', () => {
  const list = SortedList<number>({ index: x => x, sort: x => x })

  list.add(7);
  list.add(5);
  list.add(12);

  expect(list.add(2.5)).toEqual([2.5, 5, 7, 12]);
  expect(list.add(5.2)).toEqual([2.5, 5, 5.2, 7, 12]);
})

test('correctly sort when keyed differently', () => {
  const list = SortedList<number>({ index: x => x.toString(), sort: x => x })

  list.add(7);
  list.add(5);
  list.add(12);

  expect(list.add(2.5)).toEqual([2.5, 5, 7, 12]);
  expect(list.add(5.2)).toEqual([2.5, 5, 5.2, 7, 12]);
})
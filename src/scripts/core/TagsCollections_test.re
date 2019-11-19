open Jest;
open Expect;

/*
   Mocks and helpers
 */
module AnyOld = Mock.AnyOld;

let addSemiMock = (tc, tup) =>
  TagsCollections.add(tc, Collection_test.makeSemiMockPost(tup));

// Map.toList guarantees an increasing order, so it’s ok to compare lists
let toArrays =
  Belt.List.map(_, ({tag, feed}: TagsCollections.feed) =>
    (
      tag,
      feed
      ->Collection.toArray
      ->Belt.Array.map((p: Post.t) =>
          (p.source.path.full, p.meta.date->Js.Date.toISOString, p.meta.tags)
        ),
    )
  );

/*
   Tests
 */
test("All of no tags", () =>
  expect(TagsCollections.make()->TagsCollections.all) |> toEqual([])
);

test("Latest of no tags", () =>
  expect(TagsCollections.make()->TagsCollections.latest) |> toEqual([])
);

test("One post, some tags, get all", () =>
  expect(
    TagsCollections.(
      make()
      ->addSemiMock(("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"]))
      ->all
      ->toArrays
    ),
  )
  |> toEqual([
       (
         "bar",
         [|("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"])|],
       ),
       (
         "foo",
         [|("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"])|],
       ),
     ])
);

test("Several posts, get all", () =>
  expect(
    TagsCollections.(
      make()
      ->addSemiMock(("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"]))
      ->addSemiMock((
          "d/e/f.md",
          "2019-06-01T20:38:01.155Z",
          ["bar", "baz", "qux"],
        ))
      ->addSemiMock(("g/h/i.md", "2019-06-01T20:38:01.155Z", ["qux"]))
      ->addSemiMock(("j/k/l.md", "2019-06-01T20:38:01.155Z", []))
      ->all
      ->toArrays
    ),
  )
  |> toEqual([
       (
         "bar",
         [|
           ("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"]),
           ("d/e/f.md", "2019-06-01T20:38:01.155Z", ["bar", "baz", "qux"]),
         |],
       ),
       (
         "baz",
         [|
           ("d/e/f.md", "2019-06-01T20:38:01.155Z", ["bar", "baz", "qux"]),
         |],
       ),
       (
         "foo",
         [|("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"])|],
       ),
       (
         "qux",
         [|
           ("d/e/f.md", "2019-06-01T20:38:01.155Z", ["bar", "baz", "qux"]),
           ("g/h/i.md", "2019-06-01T20:38:01.155Z", ["qux"]),
         |],
       ),
     ])
);

test("Updating existing posts, get all", () =>
  expect(
    TagsCollections.(
      make()
      ->addSemiMock(("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo"]))
      ->addSemiMock(("d/e/f.md", "2019-06-01T20:38:01.155Z", ["bar"]))
      ->addSemiMock(("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"]))
      ->addSemiMock((
          "d/e/f.md",
          "2019-06-01T20:38:01.155Z",
          ["bar", "baz", "qux"],
        ))
      ->addSemiMock(("g/h/i.md", "2019-06-01T20:38:01.155Z", ["qux"]))
      ->all
      ->toArrays
    ),
  )
  |> toEqual([
       (
         "bar",
         [|
           ("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"]),
           ("d/e/f.md", "2019-06-01T20:38:01.155Z", ["bar", "baz", "qux"]),
         |],
       ),
       (
         "baz",
         [|
           ("d/e/f.md", "2019-06-01T20:38:01.155Z", ["bar", "baz", "qux"]),
         |],
       ),
       (
         "foo",
         [|("a/b/c.md", "2019-06-01T20:38:01.155Z", ["foo", "bar"])|],
       ),
       (
         "qux",
         [|
           ("d/e/f.md", "2019-06-01T20:38:01.155Z", ["bar", "baz", "qux"]),
           ("g/h/i.md", "2019-06-01T20:38:01.155Z", ["qux"]),
         |],
       ),
     ])
);

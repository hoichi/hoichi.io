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
test("Latest of no tags", () =>
  expect(TagsCollections.make()->TagsCollections.latest) |> toEqual([])
);

test("All of no tags", () =>
  expect(TagsCollections.make()->TagsCollections.all) |> toEqual([])
);

test("One post, some tags", () =>
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

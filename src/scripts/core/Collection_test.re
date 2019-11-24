open Jest;
open Expect;

/*
   Mocks and helpers
 */
module AnyOld = Mock.AnyOld;

let makeMockPost = ((id, dateStr, tags)) =>
  Post.{
    id,
    meta: {
      ...AnyOld.meta,
      date: Js.Date.fromString(dateStr),
      tags,
    },
    title: "",
    content: Markup.Markdown(""),
    excerpt: Markup.Markdown(""),
  };

let postsArray = Belt.Array.map(_, makeMockPost);
let addPosts = (c: Collection.t, posts) =>
  postsArray(posts)->Belt.Array.reduce(c, Collection.add);

/*
   Tests
 */
test("an empty collection", () =>
  expect(Collection.make()->Collection.toArray) |> toEqual([||])
);

test("single value", () =>
  expect(
    Collection.(
      make()
      ->addPosts([|("foo/bar.md", "2019-06-01T20:38:01.155Z", [])|])
      ->toArray
    ),
  )
  |> toEqual(postsArray([|("foo/bar.md", "2019-06-01T20:38:01.155Z", [])|]))
);

test("several unsorted values", () =>
  expect(
    Collection.(
      make()
      ->addPosts([|
          ("a/x.md", "2019-09-01", []),
          ("a/y.md", "2019-07-01", []),
          ("a/z.md", "2019-05-02", []),
        |])
      ->toArray
    ),
  )
  |> toEqual(
       postsArray([|
         ("a/z.md", "2019-05-02", []),
         ("a/y.md", "2019-07-01", []),
         ("a/x.md", "2019-09-01", []),
       |]),
     )
);

test("same paths get updated", () =>
  expect(
    Collection.(
      make()
      ->addPosts([|
          ("a/x.md", "2019-09-01", []),
          ("a/y.md", "2019-07-01", []),
          ("a/z.md", "2019-05-02", []),
          ("a/y.md", "2019-04-01", []),
          ("a/x.md", "2019-01-09", []),
        |])
      ->toArray
    ),
  )
  |> toEqual(
       postsArray([|
         ("a/x.md", "2019-01-09", []),
         ("a/y.md", "2019-04-01", []),
         ("a/z.md", "2019-05-02", []),
       |]),
     )
);

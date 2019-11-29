---
title: "Type-And-Test Driven Development"
date: 2019-11-04T11:53:00
slug: ttdd
tags: [ Reason, types, tdd ]
---

## The Question

I know what type-driven development is (didn’t say I’ve mastered it). I sort of get what is test-driven development, or even [red-green-refactor](https://www.jamesshore.com/Blog/Red-Green-Refactor.html). But can you do both at the same time? If you start with types, is there anything left of the green-red-refactor cycle? Or does that mean you write your tests post factum?

The typed language I use for the experiment is, by the way, ReasonML, which is basically another syntax for OCaml. Not that I think it matters much: I have more experience with TypeScript, but OCaml is seemingly a smaller language and its type system feels slightly simpler. Overall, whether a cognitive load of doing OCaml types is bigger or smaller compared to TS, it’s probably not by much. Or something.

Spoiler: turns out doing both iteratively is easier than I thought, but it’s not always such an even-going process as the basic TDD examples would make you believe.

## The Task

Let’s suppose that we need collections of blog posts to use in all kinds of post lists, like a blog feed, tag pages, and RSS. For simplicity’s sake, though, let’s not think about pagination or filtering, and instead create a simple API that allows:

- Creating a collection;
- Adding posts to a collection;
  - adding a post with the same path should update the existing record;
- Getting an array of posts;
  - should be a sorted array.

And without any further design (some people would make you think that tests are all the design you’ll ever need, and others advise you _design with types_), we set off.

## The Most Minimal Array

A real true honest-to-god TDD aficionado might start with `expect([||]) |> toBe([||])`. Coming from static types, that feels like too little code, but hey, maybe that’s a good exercise, so let’s roll with it.

But let’s actually have some code to test:

```reason
// Collection_test.re
expect(Collection.toArray()) |> toEqual([||]);

// Collection.re
let toArray = () => [||];
```

That API is not quite right. Shouldn’t we create a collection first? Shouldn’t `toArray` accept `Collection.t`? Let’s start by updating the test:

```reason
expect(Collection.make()->Collection.toArray) |> toEqual([||]);
```

That breaks our types. Let’s fix them:

```reason
let make = () => ();

let toArray = _ => [||];
```

Or, if you feel farsighted,

```reason
let make = () => [||];

let toArray = a => a;
```

Again, we try to keep up the red-green spirit and write the least amount of code to pass a test.

## Adding values

An empty collection is more or less covered; let’s add values.

```reason
// collection_test.re
expect(Collection.(make()->add(1)->toArray)) |> toEqual([|1|]);

// collection.re
let add = (arr, el) => Js.Array2.concat(arr, [|el|]);
```

Now two values.

```reason
expect(Collection.(make()->add(1)->add(2)->toArray)) |> toEqual([|1, 2|])
```

Three values!

```reason
expect(Collection.(
  make()->add(1)->add(2)->add(3)->toArray))
|> toEqual([|1, 2, 3|])
```

Hey, I could do this all day.

## And How Is It Type-Driven, Exactly?

We’re interrupting our flow to ask ourselves: isn’t all of the above just the plain old TDD (as in, _test_-driven). Weren’t we supposed to start our design like this:

```reason
type t;
let make: unit => t;
let add: (t, Post.t) => t;
let toArray: t => array(Post.t);
```

Maybe we wouldn’t even end up with those useless `int` tests. Because I already smell trouble ahead. But let’s ignore the smell for a minute and see where does this precarious path lead.

## A Stab at Sorting

Here’s a test for sorting order. Look out below.

```reason
expect(Collection.(make()->add(3)->add(5)->add(2)->add(-4)->toArray))
|> toEqual([|(-4), 2, 3, 5|])
```

I just knew it. Broken.

By the way, that test exemplifies a possible bug that types won’t catch. Not the OCaml/Reason types, at least.

But let’s implement sorting.

## Types Head Their Rear Again

This is when I’m beginning to have second thoughts about the red-green minimalism. Obviously (to me), the next _minimal_ step is to sort the `int`s to fix the test. But our actual goal isn’t to sort `int`s. We need to sort _articles_. By _dates_. And if we sort `int`s now, we’ll have more tests to refactor later.

Shall we skip to the next step then, and sort dates? The quickest would be to use polymorphic comparison, which feels a little flaky, and anyway, all this thinking got me thinking: do I want to create a collection of _anything_, or do I merely need a collection of posts? Because the former would require a functor with a few parameters.

Of course, functors are cool and make you feel like a real programmer. They also probably make property testing easier, and property tests make you feel safer. But then again, a functor would make you have to write more tests to make sure parametrization works correctly. So, no, can’t be bothered with functors for now. Not until I need to collect something other than posts.

So, answering the question of what to sort, yes, I could go and change `Collection.t` to `Js.Date.t` and rewrite the `int` tests accordingly. I’d even be able to reuse the dates sorting logic and the date values in the tests. But since I’ve already taken myself out of the busy mood, I say let’s bite the bullet and switch to the actual posts already.

## Enter The Actual Posts

One more thing before we dive back into the red-green rush. We’re probably going to create more mock posts that is healthy to read in full form. Better add some helpers for readability.

```reason
// some mocks from our stash
module Any = { module Old = Mock.AnyOld; }

let postWithDate =
  dateStr => Post.{
    meta: {
      ...Any.Old.meta,
      date: Js.Date.fromString(dateStr),
    },
    title: "",
    content: Markup.Markdown(""),
    excerpt: Markup.Markdown(""),
    source: Any.Old.source,
  };

let postsArray = Belt.Array.map(_, postWithDate);
let addPosts = (c: Collection.t, posts) =>
  postsArray(posts)->Belt.Array.reduce(c, Collection.add);
```

And with that, let’s rewrite our singleton collection test:

```reason
test("single value", () =>
  expect(
    Collection.(make()->addPosts([|"2019-06-01T20:38:01.155Z"|])->toArray),
  )
  |> toEqual(postsArray([|"2019-06-01T20:38:01.155Z"|]))
);
```

Green. All right.

## Sorting, Continued

Feel like breaking something?

```reason
test("several unsorted values", () =>
  expect(
    Collection.(
      make()->addPosts([|"2019-09-01", "2019-07-01", "2019-05-02"|])->toArray
    ),
  )
  |> toEqual(postsArray([|"2019-05-02", "2019-07-01", "2019-09-01"|]))
);
```

And we’re in the red again. Time to do the sorting.

```reason
let toArray =
  Belt.SortArray.stableSortBy(_, (p1: Post.t, p2: Post.t) =>
    Js.Date.(compare(p1.meta.date->getTime, p2.meta.date->getTime))
  );
```

That wasn’t too hard. Of course, it’s not a final implementation, as we’ll see in a minute, but we’re getting close.

## Updating by Path

There’s one part of spec left to implement. If we add a post with the same full path for a second or third or whichever time, our collection should only hold the latest value.

First, let’s add a parameter to our test helpers to accept different paths.

```reason
let postWithDate = ((fullPath, dateStr)) =>
  Post.{
    meta: {
      ...Any.Old.meta,
      date: Js.Date.fromString(dateStr),
    },
    title: "",
    content: Markup.Markdown(""),
    excerpt: Markup.Markdown(""),
    source: {
      ...Any.Old.source,
      path: {
        ...Any.Old.source.path,
        full: fullPath,
      },
    },
  };
```

Digression: did you notice how I didn’t have to update `postArray` and `addPosts`? Point-free programming in OCaml is pretty neat, even without the `composeRight` operator.

Anyway, here’s how tests should look now:

```reason
test("several unsorted values", () =>
  expect(
    Collection.(
      make()
      ->addPosts([|
          ("a/x.md", "2019-09-01"),
          ("a/y.md", "2019-07-01"),
          ("a/z.md", "2019-05-02"),
        |])
      ->toArray
    ),
  )
  |> toEqual(
       postsArray([|
         ("a/z.md", "2019-05-02"),
         ("a/y.md", "2019-07-01"),
         ("a/x.md", "2019-09-01"),
       |]),
     )
);
```

Now let’s try to repeat some paths:

```reason
test("same paths get updated", () =>
  expect(
    Collection.(
      make()
      ->addPosts([|
          ("a/x.md", "2019-09-01"),
          ("a/y.md", "2019-07-01"),
          ("a/z.md", "2019-05-02"),
          ("a/y.md", "2019-04-01"),
          ("a/x.md", "2019-01-09"),
        |])
      ->toArray
    ),
  )
  |> toEqual(
       postsArray([|
         ("a/x.md", "2019-01-09"),
         ("a/y.md", "2019-04-01"),
         ("a/z.md", "2019-05-02"),
       |]),
     )
);
```

Red, as expected. Let’s update the implementation. Our requirements sound like a job for a Map, which means we should update the `t` implementation and pretty much all the functions.

```reason
open Belt;

module PostCmp =
  Id.MakeComparable({
    type t = string;
    let cmp = Pervasives.compare;
  });

type t = Map.t(string, Post.t, PostCmp.identity);

let make = () => Map.make(~id=(module PostCmp));

let add = (m, p: Post.t) => Belt.Map.set(m, p.source.path.full, p);

let toArray = m =>
  Map.valuesToArray(m)
  ->SortArray.stableSortBy(_, (p1: Post.t, p2: Post.t) =>
      Js.Date.(compare(p1.meta.date->getTime, p2.meta.date->getTime))
    );
```

And with that, we’re green once again and more or less done.

## Conclusion

In the beginning, we’ve asked ourselves if it’s possible to combine type-driven development and red-green-refactor-flavored _test_-driven development. And the short answer is that it is indeed possible to do both at once and do it iteratively.

Of course, the above is just one data point, and neither the types nor the implementation was too complicated. Still, in this particular example, it seems the combined complexity of types and test cases is very manageable.

Here are a few finer points:

1. Even with types, you still need some unit tests. E.g., you can’t encode sorting order in types (at least not in ML).
2. It’s nice to be able to keep your red-green cycles short, but sometimes it makes more sense to slow down. That breaks your stride, yes, but I think the ability to stop and think when called for is as crucial for a programmer as the ability to pivot for an agile team.
3. It pays to have a written spec, however brief, before you start coding. Were we to start writing my “specs” in tests, or even in types, it might have taken noticeably more cycles.
4. And by the way, with the helpers we wrote, it should be relatively easy to write property tests.
5. But that is a story for another day.

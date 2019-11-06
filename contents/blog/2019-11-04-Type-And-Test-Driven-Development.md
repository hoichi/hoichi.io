---
title: "Type-And-Test Driven Development"
date: 2019-11-04T11:53:00
published: false
slug: ttdd
tags: [ Reason, types, tdd ]
---

## The Question

Ok, get what type-driven development is (didn’t say I’ve mastered it). I sort of get what test-driven development is. But can you do both for the same code? If you start with types, is there anything left of the green-red-refactor cycle? Or does that mean you write your tests post factum?

Spoiler: turns out doing both iteratively is easier than I thought, but it’s also not such an even process as the basic TDD examples would make you think.

## The Task

What we need is collections of blog posts to use in a blog pages, tag pages, and also in rss feed. For now, though, let’s not think about pagination or filtering, and create a simple API that allows:

- Creating a collection;
- adding posts to a collection;
  - adding a post with the same path should update the existing record;
- getting an array of posts;
  - should be a sorted array.

And without much design (some people would make you think that tests are all the design you need, and others advise you _design with types_), we begin.

## The Most Minimal Array

A real true honest-to god TDD aficionado would start with `expect([||]) |> toBe([||])`. Coming from statical types, that feels like too little design, but hey, maybe that’s a good exercise, so let’s roll with it. Next:

```reason
// Collection_test.re
expect(Collection.toArray()) |> toEqual([||]);

// Collection.re
let toArray = () => [||];
```

That API is not quite right. Shouldn’t we create a collection first? Shouldn’t `toArray` accept `Collection.t`? Let’s update the test first:

```reason
expect(Collection.make()->Collection.toArray) |> toEqual([||]);
```

Now we’ve broken our types. Lets fix them:

```reason
let make = () => ();

let toArray = _ => [||];
```

Or, if you feel farsighted,

```reason
let make = () => [||];

let toArray = a => a;
```

Again, I try keep up the red-green spirit and write the minimum of code to pass the test.

## Adding values

An empty collection is more or less covered, let’s add some values.

```reason
expect(Collection.(make()->add(1)->toArray)) |> toEqual([|1|]);
```

2 values.

```reason
expect(Collection.(make()->add(1)->add(2)->toArray)) |> toEqual([|1, 2|])
```

3 values

```reason
expect(Collection.(
  make()->add(1)->add(2)->add(3)->toArray))
|> toEqual([|1, 2, 3|])
```

Ok, ok, let’s stop before someone gets hurt.

## And How Is It Type-Driven, Exactly?

We’re interrupting our flow to ask ourselves: isn’t all of the above just the plain old TDD (as in, _test_-driven). Weren’t we supposed to start our design like this:

```reason
type t;
let make: unit => t;
let add: (t, Post.t) => t;
let toArray: t => array(Post.t);
```

Maybe we wouldn’t even end up with those useless `int` tests. Because I already smell trouble ahead. But so far, let’s continue on our precarious path and see where it leads.

## Sorting, Interrupted

Let’s test for sorting order. Look out below.

```reason
expect(Collection.(make()->add(3)->add(5)->add(2)->add(-4)->toArray))
|> toEqual([|(-4), 2, 3, 5|])
```

I knew it. Broken. Let’s implement the sorting then.

## Types Head Their Rear Again

This is when I’m beginning to have second thoughts about the red-green minimalism. Obviously (to me), the nex _minimal_ step is to sort the `int`s to fix the test. But our actual problems doesn’t tell us to sort `int`s. We need to sort _articles_. By _dates_. And if we sort `int`s now, we’ll have more tests to refactor later.

Shall we skip to the next step then, and sort dates? Oh, but all this thinking has taken me out of the mood to write tests. Let me think some more.

_If_ I add a new test with dates, I would at least need a polymorphic comparator, which the OCaml crowd discourages, but to which the BuckleScript docs have no objections, because BS compiles to JavaScript anyway. But then it compiles polymorphic date comparison to `Caml_obj.caml_lessthan(new Date(), new Date("2018-12-31"))`. Hmm, where was I going with that?

It feels flaky, that’s where I was going (but maybe it isn’t). And anyway, all this thinking got me thinking: do I want to create a collection of anything, or do I just need a collection of post? Because the former would require a functor with a few parameters.

Of course, functors are nice. They make you feel like you do some real programming. Also, a functor would make property testing easier, and property tests make you feel safer. But then again, a functor would make you have to write more tests just to make sure parametrization works correctly. So no, let’s say that for now, I can’t be bothered with functors. Not before I need to collect something other than posts.

So, getting back to sorting, I could go and change `Collection.t` to `Js.Date.t` and rewrite the `int` tests accordingly. I’d even be able to reuse the date sorting logic and the date values in test. But since I’ve already took myself out of the busy mood, I say let’s bite the bullet and switch to the actual posts already.

## Enter The Actual Posts

But before we get back into the red-green rush, let’s procrastinate a wee bit more. We’re probably going to create a few mock posts for our tests, so let’s create some helpers for greater readability.

```reason
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

Green. Alright.

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

Happy now? It’s broken!

Now let’s do the sorting.

```reason
let toArray =
  Belt.SortArray.stableSortBy(_, (p1: Post.t, p2: Post.t) =>
    Js.Date.(compare(p1.meta.date->getTime, p2.meta.date->getTime))
  );
```

That wasn’t too hard. Of course, it’s not a final implementation, as we’ll see in a minute, but it’s pretty close.

## Updating by Path

There’s one part of spec left to implement. Basically, if we add a post with the same full path a second or third or whichever time, our collection should only hold the latest value.

First, let’s upgrade our test helpers to accept different paths.

```reason
let postWithDate = ((fullPath, dateStr)) =>
  Post.{
    meta: {
      ...AnyOld.meta,
      date: Js.Date.fromString(dateStr),
    },
    title: "",
    content: Markup.Markdown(""),
    excerpt: Markup.Markdown(""),
    source: {
      ...AnyOld.source,
      path: {
        ...AnyOld.source.path,
        full: fullPath,
      },
    },
  };
```

And here’s how tests should look now:

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

Red, of course. Let’s update the implementation. Sounds like a job for a set, which means we should update the `t` implementation, and also, `toArray`.

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

And with that, we’re more or less done.

## Summary

In the beginning we’ve asked ourselves is it possible to combine type-driven development and red-green-refactor-flavored test driven development. And the short answer is that it is indeed possible to more or less combine both and do it iteratively.

Of course, the above is just one data point, and the module signature wasn’t too complicated, but in this particular example it seems the combined complexity of types and test cases isn’t to great.

Here’s a few finer points:

1. You still do need unit tests even if you have types. E.g., you can’t encode sorting order in types (at least not in ML).
2. It’s nice to be able to keep your red-green cycles short, but sometimes you still have to stop and think. Of course that breaks your stride, but I think the ability to stop and think is as crucial for a programmer as the ability to pivot for an agile team.
3. It pays to have a written spec, however brief, before you start coding. Were I to start writing my “specs” in tests, or even in types, it might take much, much longer.

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

## Sorting

Let’s test for sorting order. Look out below.

```reason
expect(Collection.(make()->add(3)->add(5)->add(2)->add(-4)->toArray))
|> toEqual([|(-4), 2, 3, 5|])
```

I knew it. Broken. Let’s implement the sorting

## Types Head Their Rear Again

This is when I’m beginning to have second thoughts about the red-green minimalism. Obviously (to me), the nex _minimal_ step is to sort the `int`s to fix the test. But our actual problems doesn’t tell us to sort `int`s. We need to sort _articles_. By _dates_. And if we sort `int`s now, we’ll have more tests to refactor later.

Shall we skip to the next step then, and sort dates? Oh, but all this thinking has taken me out of the mood to write tests. Let me think some more.

_If_ I add a new test with dates, I would at least need a polymorphic comparator, which the OCaml crowd discourages, but to which the BuckleScript docs have no objections, because BS compiles to JavaScript anyway. But then it compiles polymorphic date comparison to `Caml_obj.caml_lessthan(new Date(), new Date("2018-12-31"))`. Hmm, where was I going with that?

It feels flaky, that’s where I was going (but maybe it isn’t). And anyway, all this thinking got me thinking: do I want to create a collection of anything, or do I just need a collection of post? Because the former would require a functor with a few parameters.

Of course, functors are nice. They make you feel like you do some real programming. Also, a functor would make property testing easier, and property tests make you feel safer. But then again, a functor would make you have to write more tests just to make sure parametrization works correctly. So no, let’s say that for now, I can’t be bothered with functors. Not before I need to collect something other than posts.

So, getting back to sorting, I could go and change `Collection.t` to `Js.Date.t` and rewrite the `int` tests accordingly. I’d even be able to reuse the date sorting logic and the date values in test. But since I’ve already took myself out of the busy mood, I say let’s bite the bullet and switch to the actual posts already.

## Enter The Actual Posts



---
title: "Tail-optimized functions in ReasonML"
date: 2018-09-15T11:30:00
slug: ptc-in-reason
excerpt: For that mechanism to work, you have to be sure you don’t do anything with the result of the recursive call other than return it as is. That way, you don’t have to return at all. The function instance that is called last evaluates the final result and returns it straight to the original callee.
tags: [ recursion, FP, OCaml, Reason, BuckleScript ]
---

All the examples are in [ReasonML](https://reasonml.github.io), which, very roughly speaking, is a cross of OCaml & JS I’m very interested in at the moment.

With that intro aside, let’s write a function that generates a range of ints, i.e., takes a tuple of `(beginning, end)` and returns a list of all `int`s in between, including the boundaries. The naive approach:

```reason
let rec genRange = ((min, max)) =>
  min > max
    ? []
    : [min, ...genRange((min + 1, max))];
```

The problem with it is if the range is rather long, it may cause a stack overflow. See this expression: `[min, ...genRange((min + 1, max))]`? To evaluate it the machine has to wait for the recursive call to return and then use the return value to build the longer list.

(Would be even worse with arrays, by the way. You’d have as many arrays as there would be elements in a final result, and they wouldn’t share any of the memory between them, effectively allocating about `(len+1) * len/2` elements, none of which could be garbage collected or otherwise freed until the most deeply nested calls start to return.)

Now, both the native OCaml compiler and BuckleScript (the latter compiles OCaml/ReasonML to JS) support tail call optimization. Meaning that instead of adding another frame to the stack, the compiler makes the generated code to reuse the current one. (It’s a bit different in JS code, but we’ll get to it later.)

For that mechanism to work, you have to be sure you don’t do anything with the result of the recursive call other than return it as is. That way, you don’t have to return at all. The function instance that is called last evaluates the final result and returns it straight to the original callee.

However, that means that the instance you call last should have all the data to evaluate that final value. Passed as parameters (since we’re talking FP). So, our old naive `gen_range` doesn’t cut it.

`gen_range` already has `min` and `max` as its parameters. What does it lack from that expression, `[min, ...gen_range((min + 1, max))]`, to evaluate full list on the final step?

`min`? We already have it. The result of `gen_range(min + 1, max)`? That’s more like it. We need to pass the current version of the list to build the next one. Let’s add `list` as a parameter:

```reason
let rec genRangeTco = (list, (min, max)) =>
  max < min
    ? list
    : genRangeTco([max, ...list], (min, max - 1));
```

You might have noticed that now we do not increase `min`, we decrease `max` instead. Looks a bit unnatural, especially if your ‘natural’ is the good old `i++`, but it’s closer to how lists are built: what was the head yesterday, today is part of the tail.

Another quite noticeable thing is that the signature is less convenient now: you have to provide an empty list as a parameter. This is why with TCO functions, the recursive one is usually a helper function, and users get a dumbed down version:

```reason
let genRangeTco = {
  let rec helper = (list, (min, max)) =>
    max < min
      ? list
      : helper([max, ...list], (min, max - 1));

  helper([]);
};
```

`helper([])` is a partial application, by the way, pre-applying an empty list to `helper` and returning a function that expects a tuple of `(min, max)`, just like our first version.

One last thing. The future of tail call optimization proposal is, as I’m writing this, [quite murky](https://www.reddit.com/r/node/comments/8qfhy0/what_happened_to_tco_tail_call_optimization_after/). But the BuckleScript compiler (that, again, kind of powers ReasonML), hellbent as it is on performance of the JS it generates, won’t be denied. See what it does with the naive version first: [the good ole recursive call](https://reasonml.github.io/en/try?rrjsx=true&reason=DYUwLgBATiDGEHMQDsBKBDZSIF4IAp8BbAS2QBoIj0APASjtwD4AoCKsiJq2t9iAPwQA2gF0+7AFwjSFCADpFSNJiSFZEANQQAjJWr06ogNwsgA), nothing special, amirite? And now, behold, [the tail-optimized version](https://reasonml.github.io/en/try?rrjsx=true&reason=DYUwLgBA5iB2BKBDWMAqBjA9hAvBA3gFAQSiQBOI6EAFiMAA4jm4QAUwAlgM5gA07ALadYAwYgAeASim4AfMRIRxEiAB5lIxUogB+UjzDalALlr0m5NgG0VAgHSOuvALoC2w0cskQAtBABGGQBuQkU6RmYbFylQgF9QoA). It’s got compiled to a loop!

See why I’m interested in Reason?

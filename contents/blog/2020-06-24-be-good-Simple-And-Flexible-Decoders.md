---
title: "be-good: Simple and Flexible Data Decoders for TypeScript"
date: 2020-06-24T21:53:00
published: true
slug: be-good-intro
tags: [TypeScript, decoders, JSON]
excerpt: This post is an introduction to both JSON decoders and my humble library of building blocks for them, called be-good.
---

## Intro

This post introduces both JSON decoders and my humble library of decoder building blocks, called [`be-good`](https://github.com/hoichi/be-good). Let’s start with the first.

## What Are Decoders And Why Do We Need Them

JSON decoders are well known in statically typed languages like Elm or ReasonML (and are probably older than those two). Static types are a great way to catch many bugs at compilation time, which is sweet when the alternative is chasing those bugs in production. And even when it comes to _preventing_ bugs, static types have some advantages over other techniques. I won’t discuss types vs. tests here, tempted as I am,  but defensive programming is obviously wordier (thus obscuring business logic and creates more places for bugs to hide) and has some runtime cost.

But of course, even the most sound type system keeps you safe only if it controls the whole data lifecycle, cradle to grave. If the data comes from the outside world (say, across the network), what can the compiler say? If your types suggest a request returns data of type `{ status: Status, data: Data }` but instead you get `{ status: -1, error: {}}`, not only can your code break in runtime; it can also bring down your whole app exactly _because_ you thought you didn’t need no stinking defensive programming any more, and now your code has no immunity.

Sure, there are situations where you can trust your types for external data, e.g., whey you generate them from a Swagger or a GraphQL schema. If you have something like that, and your DevOps scenarios are sound, you probably don’t need decoders—congrats, godspeed, carry on.

But maybe you don’t have that luxury. Perhaps you have a lot of legacy back-end, or it’s some tool developed by a single intern with no notion of what REST is, or the API is third-party. There are plenty of reasons you might have zero control over the API, and so typegen may be out of the question. Or maybe your app is just too small to bother, or you hate modern tooling and generally can’t be arsed.

Whatever your reasons, decoders may be of use. Let’s start with a (very loose) definition:

> A decoder is a function that takes some external data that could be anything and makes sure it _is_ of the type it’s supposed to be.

## Enter `be-good`

But enough of theory, let’s see some code:

```ts
import { be, beObjectOf, or } from 'be-good';
import { isString } from 'lodash';

const beString = be(isString);
const optional = or(null);

type User = {
    name: string,
    surname: string,
    middleName?: string,
}

const userDecoder = optional(
    beObjectOf<User>({
        name: beString,
        surname: beString,
        middleName: optional(beString)
    })
);
// typeof userDecoder === (x: unknown) => User | null
```

Here’s how it treats various inputs:

```ts
userDecoder(false)  // null: not an object
userDecoder({}) // null: missing some properties
userDecoder({ name: 0, surname: true }) // wrong property types
userDecoder({ name: 'Jackie', surname: 'Chan' })
// { name: 'Jackie', surname: 'Chan' } (middleName is optional)
userDecoder({ name: 'Samuel', middleName: 'L.', surname: 'Jackson' })
// { name: 'Samuel', middleName: 'L.' surname: 'Jackson' }
```

As you see, its runtime behavior is true to its signature: whatever the input, it returns either a value of type `User`, or `null`.

## Basic building block: `be`

Immoral though it might sound, the most important part of `be-good` is `be`. `be` is a _decoder factory_, i.e., it _creates decoders_. Its signature looks like this:

```ts
function be<T>(predicate: (a: any) => a is T): Decoder<T>
```

The `a is T` part is crucial: the factory `be` takes a [user-defined type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards). Happily, functions like `lodash/isString` or those in [check-types](https://www.npmjs.com/package/@types/check-types) are typed exactly like that. And later in this post, we’ll see how to roll your own.

What does `be` return? Given a predicate asserting that `a is T`, `be` returns `Decoder<T>`, i.e., `(x: unknown) => T`. So, whenever the predicate returns `true`, the resulting decoder returns a value of type `T`.

“But what if the predicate returns `false`?!”—an acute reader might cry in alarm. In that case, since the return type only allows values of type `T` and the input is quite obviously _not_ of type `T`, the decoder has literally no other recourse but to _throw a bloody exception_. E.g.:

```ts
const beString = be(isString);
beString('foo'); // 'foo'
beString(12); // throws
```

## Catching decorators: `or`

So, decoders can throw. One way to deal with that is to let whole parts of your application fail and show some fallback UI, e.g., using React’s [error boundaries](https://reactjs.org/docs/error-boundaries.html). This approach makes sense, but there are cases to be made for catching decoding exceptions closer to its source.

One of those cases is some data can be quite optional, as we’ve seen with `middleName` above:

```ts
const optional = or(null);

const beUser = beObjectOf({
    name: beString,
    surname: beString,
    middleName: optional(beString)    
});
```

No need to invalidate a whole user because she doesn’t have a middle name.

Another case is when you validate/invalidate your data rather far from the code that displays any UI (e.g., you put the decoded data in a Redux store and then update your components with it). Then it makes sense to express invalidity of
the data with... well, data.

```ts
const optional = or(null);
const beUser = optional(beObjectOf(/*...*/)); // unknown -> (User | null)

// somewhere in JSX
{user ?? (
<div className="section">
    <UserInfo {...user} />
</div>)}
```

A third case is a default value.

```ts
const orZero = or(0);
const beSum = orZero(beNumber); // unknown -> (number)
```

As you’ve probably divined from the examples above, `or` accepts a fallback
value and returns a decorator function. Decorator is then applied to a decoder
and, being a decorator, returns a new decoder. That new decoder never throws:
when the input data is invalid, it returns the fallback value instead. In a
bastardized semi-haskellish type notation, its signature is:

```ts
Fb => (In => Out) => In => (Out | Fb) 
```

Put another way, when the original decoder returns values of type `A`, and the fallback value you give to `or` is of type `B`, the resulting (decorated)
decoder returns values of type `A | B`. `A` and `B` can differ (e.g., you can use nullish—or any other values to signal invalid/missing data) or they can coincide (e.g., when a fallback is just a default value). This (as many other things with be-good) is totally up to the consumer.

## Decoding objects, arrays, and dictionaries

You have already seen `beOjectOf` in action: it checks if the input is an object, and then it validates the object properties, it’s rather self-explanatory. Let’s move on to collections, e.g., arrays and dictionaries. For that, we have two other factories.

`beArrayOf` and `beDictOf` are similar to `beObjectOf`, but their parameters are a bit different. First, they take a single element decoder—meaning all the elements are supposed to be of the same type. Second, the factory can optionally take a config:

```ts
type BeCollectionOptions = {
  /** What to invalidate on errors: one element or the whole collection */
  invalidate?: 'single' | 'all'
  /** Minimum count of (valid) collection elements */
  minSize?: number
}
```

Some examples:

```ts
const beNumber = be(isNumber)

beArrayOf(beNumber)([3, 25.4, false, -7])
// [3, 25.4, -7], because by default, `invalidate` option is 'singe',
// and that means simply omitting invalid elements

beArrayOf(beNumber, { invalidate: 'all' })([3, 25.4, false, -7])
// throws on reaching the first bad element

const orFallback = or('<fallback>') 
beArrayOf(orFallback(beNumber))([3, 25.4, false, -7])
// [3, 25.4, '<fallback>', -7], compare to the first example

beArrayOf(beNumber, { minSize: 4 })([3, 25.4, false, -7])
// throws: only 3 valid elements

/* beDictOf works pretty similarly, and in fact, takes the same options */

beDictOf(beNumber)({ a: 3, b: 25.4, c: false, d: -7 })
// { a: 3, b: 25.4, d: -7 }
// etc...
```

### Decoding nested structures

Since `beObjectOf`, `beArrayOf`, and `beDictOf` take other decoders, they can also take the object/collection decoders, meaning you can nest them if necessary:

```ts
const beNestedData = beObjectOf({
    items: beArrayOf(beObjectOf({
        id: beNumber,
        dict1: beDictOf(beNumber),
        dict2: or({})(beDictOf(beString))
    }))
})
```

Mind where you catch though: if you don’t use `or`—and you use `invalidate: ‘all’` a lot, a single wrong property can invalidate your whole structure.

### A note on generics and type inference

`beObjectOf` and it’s brethern are generic, but you don’t have to spell out `beObjectOf<Foo>` all the time. The decoder return type will be inferred from the property decoders you gave to `beObjectOf`: e.g.
`beObjectOf({ a: beString })` will have type `(x: unknown) => { a : string }`.
And since TypeScript types are structural, it doesn’t matter how the type is
called as long as the shape is right.

But if you make a mistake in a property name or a kind of decoder you give to `beObjectOf`, TypeScript _will_ fail—somewhere—and the error message might point to a place far from where the actual error is, and you’ll spend more time fixing it. It might be better to specify the expected type right inside a decoder (like above), or maybe right outside of it, like this:

```ts
import { beOjbectOf, Decoder } from 'be-good'
// ...
const objDecoder: Decoder<Type> = optional(beObjectOf(/* ... */))
```

Fail early, I say.

## Custom predicates and custom decoders

I think that’s quite enough for one post already (finish early, I say), but I must mention an essential design goal of `be-good`: being flexible. Indeed, it’s more flexible than the above examples might suggest. For one thing, the type guards from Lodash are handy, but what if you want to check for more?

```ts
const isEven = (n: unknown): n is number => isNumber(n) && n % 2 === 0;

const beEven = be(isEven) // unknown => number
```

If you dig opaque types, you can use those too (the enum trick is from
[an article by Patrick Bacon](https://spin.atomicobject.com/2017/06/19/strongly-typed-date-string-typescript/)).

```ts
  enum PriceBrand {}
  type Price = number & PriceBrand
  const isPrice = (n: unknown): n is Price => isNumber(n) && n > 0
  const bePrice = be(isPrice) // unknown => Price
```

You can also write whole custom decoders, be it because you cannot validate
fields separately, or because you need to ~~mess with~~ manipulate your data
structure. Enter two low-level helpers: `beObject` (not to be confused with
`beObjectOf`) and `fail`:
 
```ts
import { be, beObject, fail, or } from 'be-good'

type Range = {
  min: number;
  max: number;
}

type rangeDecoder = or(null)((input: unknown): Range => {
  // note that `start` and `end` are the properties of the input, not of the output
  const { start, end } = beObject(input) // typeof start === typeof end === unknown

  if (!isNumber(start) || !isNumber(end) || end > start) fail('Invalid range')

  return { min: start, max: end }
})
```

Note how the earlier examples mostly compose functions, but as you see here,
that’s not the only resource you have. Sure, here we still use a catching
decorator™ (i.e., the result of `or(null)`), which counts as functional
composition. But you can also create variables, fail the decoder imperatively
and do all the stuff you typically do in JavaScript—even though I don’t
recommend side effects in your decoders. And sure, you could write this
particular decoder in a more functional fashion, but the point is you don’t have
too. `be-good` is not hellbent on forcing one specific programming style.
   
Another important thing is using `fail` to... well, fail the decoder. Notice
how, like `beObject`, `fail` is used inside a function wrapped in a catching
decorator. You don’t want unchecked exceptions everywhere. And while on the one
hand, you have to remember that decoders use exceptions under the hood (and may
blow that hood if you don’t pay attention), on the other hand, it’s not a good
idea to throw exceptions manually. If you want to fail your decoder, call
`fail`. So far, it doesn’t do much besides throwing, but it might in the future,
so don’t break the abstraction.

## Left unsaid

I don’t believe `be-good` is complete: it misses mechanisms for decoding sum types (unions), proper docs, type tests, and maybe it needs better error messages (file an issue if you think it does). I also probably haven’t done writing about it. What’s left unsaid is:

- design goals
- comparison to known alternatives (see [gcanti/io-ts](https://github.com/gcanti/io-ts) & [nvie/decoders](https://github.com/nvie/decoders)) 
- comparing `null(ish) | Entity` with monadic types like `Result`
- advanced composability of decoders
- why the hell the functions are not curried
- and so probably on

In the meantime, [try be-good](https://github.com/hoichi/be-good#installation), play with it, file some issues, maybe even contribute if you like, and stay safe.
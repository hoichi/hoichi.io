---
title: "be-good: Simple and Flexible Data Decoders for TypeScript"
date: 2020-06-15T11:53:00
published: false
slug: be-good-p1
tags: [TypeScript, "decoders"]
excerpt: This post is an introduction to both JSON decoders and my humble library of building blocks for them, called be-good.
---

## Intro

This post is an introduction to both JSON decoders and my humble library of building blocks for them, called [`be-good`](https://github.com/hoichi/be-good). Let’s start with the start.

## What Are Decoders And Why Do We Need Them

JSON decoders are well-known in static type languages like Elm or ReasonML (I think they predate both a bit). Static types are a great way to catch a great deal of bugs at the compile time. Which is definitely sweet when the alternative is catching those bugs in production, but even if we’re talking about preventing bugs, static types get some advantages over both unit tests (which we won’t discuss here, tempted that I am) and defensive programming, which is more verbose (and therefore obscures business logic and creates more places for bugs to hide) and has some runtime cost.

But of course, even the most sound type keeps you safe only if it controls the whole data lifecycle, cradle to grave. If the data comes from the outside world (say, across the network), what does the compiler know about that? If you just say this request returns data of type `{ status: Status, data: Data }` but instead you get `{ status: -1, error: {}}`, not only can your code break in runtime, but it can also bring down your whole app _exactly because_ you thought you didn’t need no stinking defensive programming no more and now your code has no immunity.

Sure, there are situations where you can trust your types for external data, e.g., whey you generate them from a Swagger or a GraphQL schema. If you have something like that, and your devops is sound, you probably don’t need decoders—congrats, godspeed, best regards.

But maybe you don’t have that luxury. Maybe you have a lot of legacy backend, maybe it’s some tool developed by a single intern with no notion of what REST is, maybe it’s some third-party API: lots of reasons why you might have zero say in the matters of the API tooling, so typegen is out of the question.

This is exactly where the decoders come in. A decoder is a function that takes some external data that could in theory be anything, and checks if it really is of the type it’s supposed to be.

## Enter `be-good`

Bet you’re ready to see some code. Here you are:

```ts
import { be, beObject, or } from 'be-good';
import { isString } from 'lodash';

const beString = be(isString);
const optional = or(null);

type User = {
    name: string,
    surname: string,
    middleName?: string,
}

const userDecoder = optional(
    beObject<User>({
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
userDecoder({ name: 'Jackie', surname: 'Chan' }) // { name: 'Jackie', surname: 'Chan' } (middleName is optional)
userDecoder({ name: 'Charles', middleName: 'L.', surname: 'Jackson' }) // { name: 'Samuel', middleName: 'L.' surname: 'Jackson' }
```

## Basic building block: `be`

Immoral though it might sound, the most important part of `be-good` is `be`. `be` is a _decoder factory_, i.e. it _creates decoders_. Its signature looks like this:

```ts
function be<T>(predicate: (a: any) => a is T): Decoder<T>
```

The `a is T` part is crucial: the factory `be` takes a [user-defined type guard](https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards). Happily, functions like `lodash/isString` or those in [check-types](https://www.npmjs.com/package/@types/check-types) are typed exactly like that. And later we’ll see how to roll your own.

What does `be` return? Given a predicate asserting that `a is T`, `be` returns `Decoder<T>`, i.e., `(x: unknown) => T`. So, the resulting decoder, when the predicate returns `true`, in its turn returns a value of type `T`.

“But what if the predicate returns `false`?”—an acute reader might ask. Well, in that case since the return type only allows values of type T, and the input is quite obviously _not_ of type T, the decoder has no other recourse but to _throw an exception_. E.g.:

```ts
const beString = be(isTring);
beString('foo'); // 'foo'
beString(12); // throws
```

## Catching decorators: `or`

Ok, so decorators can throw. One way to deal with that is let whole parts of you application fail and show some fallback UI, e.g., using React’s [error boundaries](https://reactjs.org/docs/error-boundaries.html). This approach is totally legit, but there are cases to be made for catching decoding exceptions closer to its source.

One of those case is some data can be quite optional, as we’ve seen with `middleName` above:

```ts
const optional = or(null);

const beUser = beObject({
    name: beString,
    surname: beString,
    middleName: optional(beString)    
});
```

No need to invalidate user data just because middleName is missing.

Another case is when you validate/invalidate your data rather far from the code that displays any UI (e.g., you put the decoded data in a Redux store and then update your components with it). Then it makes sense to express invalidity of the data with... well, data.

```ts
const optional = or(null);
const beUser = optional(beObject(/*...*/)); // unknown -> (User | null)

// somewhere in JSX
{user ?? <UserInfo {...user} />}
```

A third case is a default value.

```ts
const orZero = or(0);
const beSum = orZero(beNumber); // unknown -> (number)
```

As you’ve probably divined from the examples above, `or` accepts a fallback value and returns a decorator function. Decorator is then applied to a decoder and, being a decorator, returns a new decoder. That new decoder never throws: when the input data is invalid, it returns the fallback value instead. In a bastardized semi-haskellish type notation, its signature is:

```ts
Fb => (In => Out) => In => Out | Fb 
```

In other words, when the original decoder returns values of type `A`, and the fallback value you give to `or` is of type `B`, the decorated decoder returns values of type `A | B`. `A` & `B` may differ (e.g., you can use nullish values to signal invalid/missing data) or they can coincide (e.g., when a fallback is just a default value)—this is totally up to the consumer.
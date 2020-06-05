---
title: "Simple Sum Types In TypeScript Without Common Fields"
date: 2020-06-05T11:53:00
slug: ts-simple-sum
tags: [TypeScript, tricks, React]
excerpt: All the glory of the discriminated unions, none of the ceremony. And nobody gets anyone’s goat.
---

[Discriminated unions](https://www.typescriptlang.org/docs/handbook/advanced-types.html#discriminated-unions) are well known in TypeScript. Their only (?) downside is they need a common property usually named `kind` or `tag`, e.g.:

```ts
type RenderProps<T> =
| { kind: 'children',
    children: (x: T) => ReactElement | null;
  }
| { kind: 'render',
    render: (x: T) => ReactElement | null;
  }
```

Which makes it a tad too wordy to use:

```tsx
const RPComponent = (props: RenderProps<number>) => {
    switch(props.kind) {
    case ('children'):
        return props.children(42);
    case ('render')
        return props.render(42);
    }
}

// elsewhere
<RPComponent kind="render" render={n => <i>{n}</i>} />
```

Now, I’m fine with JS in templates (if you still call of JSX as of templates, and why not), but that unnecessary `kind` prop gets my goat.

So here’s a more compact solution:

```ts
type RenderProps<T> =
| { children: (x: T) => ReactElement | null;
    render?: never;
  }
| { children?: never;
    render: (x: T) => ReactElement | null;
  }

const RPComponent = (props: RenderProps<number>) =>
    (props.children || props.render)(42);

// and
<RPComponent render={n => <i>{n}</i>} />
```

It’s still a sum type (you can neither omit both `children` and `render` nor provide them both), but now you don’t need no stinking `kind` anywhere.

Mind that for some reason it’s not enough to declare the union variants as `{ chidlren: SomeType, render: undefined }`. At least for JSX, TypeScript will want you to still _specify_ a prop and give it a value of `undefined`. But `render?: undefined` (or `never`, which, I think, better conveys your intention) does the trick.
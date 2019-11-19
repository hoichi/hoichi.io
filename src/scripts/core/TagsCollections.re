open Belt;

module CollectionCmp =
  Id.MakeComparable({
    type t = string;
    let cmp = Pervasives.compare;
  });

type t = Map.t(string, Collection.t, CollectionCmp.identity);

type feed = {
  tag: string,
  feed: Collection.t,
};

let make = () => Map.make(~id=(module CollectionCmp));

/**
 * For every tag in a post
 * - either find an existing collection, and add to it
 * - or create a new one and add to it
 */
let add = (t, post: Post.t) =>
  post.meta.tags
  ->List.reduce(
      t,
      (t, tag) => {
        let feed = t->Map.getWithDefault(tag, Collection.make());
        t->Map.set(tag, feed->Collection.add(post));
      },
    );

let all = t =>
  t->Belt.Map.toList->Belt.List.map(((tag, feed)) => {tag, feed});

// todo: actual latest
// keep some private `lastAdded`
let latest = all;

/*
   todo [later]
     - removal of an added tag
 */

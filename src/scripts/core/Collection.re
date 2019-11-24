open Belt;

module PostCmp =
  Id.MakeComparable({
    type t = string;
    let cmp = Pervasives.compare;
  });

type t = Map.t(string, Post.t, PostCmp.identity);

let make = () => Map.make(~id=(module PostCmp));

let add = (m, p: Post.t) => Belt.Map.set(m, p.id, p);

let toArray = m =>
  Map.valuesToArray(m)
  ->SortArray.stableSortBy(_, (p1: Post.t, p2: Post.t) =>
      Js.Date.(compare(p1.meta.date->getTime, p2.meta.date->getTime))
    );

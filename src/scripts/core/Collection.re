type t = array(Post.t);

let make = () => [||];

let add = (arr, el) => Js.Array2.concat(arr, [|el|]);

let toArray =
  Belt.SortArray.stableSortBy(_, (p1: Post.t, p2: Post.t) =>
    Js.Date.(compare(p1.meta.date->getTime, p2.meta.date->getTime))
  );

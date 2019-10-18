module Js_date = {
  include Js_date;
  [@bs.deriving abstract]
  type localeDateStringOptions = {
    month: string,
    day: string,
    year: string,
  };

  // mind that any other language than English requires ICU on Node
  [@bs.send]
  external toLocaleDateString: (t, string, localeDateStringOptions) => string =
    "toLocaleDateString";
};

module Strings = {
  // todo: use mast since we use remark anyway
  let getFirstParagraph = content =>
    [%bs.re "/(?:\\n*)([\\S\\s]+?)(?:\\n\\n+|$)/g"]->Js.Re.exec_(content)
    |> (
      fun
      | Some(result) =>
        Js.Re.captures(result)->Js.Array2.unsafe_get(1)->Js.Nullable.toOption
      | None => None
    );
};

let dateShort = t =>
  Js_date.(
    t->toLocaleDateString(
      "en-US",
      localeDateStringOptions(
        ~month="short",
        ~day="numeric",
        ~year="numeric",
      ),
    )
  );

let renderArray = (a, cb) => Belt.Array.map(a, cb) |> ReasonReact.array;
let renderList = (l, cb) => Belt.List.toArray(l)->renderArray(cb);

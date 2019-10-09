open Tablecloth;

module Js_date = {
  include Js_date;
  [@bs.deriving abstract]
  type localeDateStringOptions = {
    month: string,
    day: string,
    year: string,
  };
  [@bs.send]
  external toLocaleDateString: (t, string, localeDateStringOptions) => string =
    "";
};

module Strings = {
  let getFirstParagraph = content =>
    [%bs.re "/(?:\\n*)([\\S\\s]+?)(?:\\n\\n+|$)/"]->Js.Re.exec_(content)
    |> (
      fun
      | Some(result) => Js.Nullable.toOption(Js.Re.captures(result)[1])
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
let renderList = (l, cb) => Belt.Array.fromList(l)->renderArray(cb);

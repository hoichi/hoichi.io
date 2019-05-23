module Js_date =
  struct
    include Js_date
    type localeDateStringOptions = {
      month: string;
      day: string;
      year: string;}[@@bs.deriving abstract]
    external toLocaleDateString :
      t -> string -> localeDateStringOptions -> string = ""[@@bs.send ]
  end

module Strings = struct
    let getFirstParagraph content =
      [%bs.re "/(?:\\n*)([\\S\\s]+?)(?:\\n|$)/"]
      |. Js.Re.exec_ content
      |.
        (function
         | ((Some (matches))[@explicit_arity ]) ->
             ((Js.Re.captures matches).(1)) |. Js.Nullable.toOption
         | None  -> None
        )
end

let dateShort t =
  let open Js_date in
    (t |. toLocaleDateString) "en-US"
      (localeDateStringOptions ~month:"short" ~day:"numeric" ~year:"numeric")
let renderArray a cb = (Belt.Array.map a cb) |> ReasonReact.array

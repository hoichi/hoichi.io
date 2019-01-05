module RR = ReasonReact;

let component = RR.statelessComponent("PageHeader");

/* underscores before names indicate unused variables. We name them for clarity */
let make = (~title, ~category=?, _children) => {
  ...component,
  render: _self =>
    <header className="b-Masthead u-centered" role="banner">
      <div className="b-Masthead__breadcrumbs">
        <a href="/"> {RR.string("hoichi.io")} </a>
        {RR.string(" /")}
        {switch (category) {
         | Some(cat) =>
           <>
             <a href={"/" ++ (cat == "blog" ? "" : cat)}>
               {RR.string(cat)}
             </a>
             {RR.string(" /")}
           </>
         | _ => RR.null
         }}
      </div>
      <h1> {RR.string(title)} </h1>
    </header>,
};

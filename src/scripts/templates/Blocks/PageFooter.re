module RR = ReasonReact;

[@react.component]
let make = (~humble=false) => {
  <footer id="colophon" className="b-Colophon u-centered" role="contentinfo">
    <p>
      {RR.string("---")}
      <br />
      {RR.string("Hosted by ")}
      <a href="https://netlify.com"> {RR.string("Netlify")} </a>
      {RR.string(". The font is ")}
      <a href="https://typeof.net/Iosevka/"> {RR.string("Iosevka Slab")} </a>
      {RR.string(".")}
      {humble
         ? RR.null
         : <>
             <br />
             {RR.string("And oh, ")}
             <a href="/me"> {RR.string({j|I’m hoichi|j})} </a>
             {RR.string(".")}
           </>}
    </p>
  </footer>;
};

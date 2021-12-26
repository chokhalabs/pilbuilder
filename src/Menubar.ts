import { createElement as h } from 'react';



export default function( props: { selectedTool: string; onSelectTool: (key: string) => void } ) {
  function createClass(key: string) {
    return key === props.selectedTool ? "tool selected" : "tool";
  }
  return h(
    "div", 
    { 
      className: "menubar", 
      key: "menubar" 
    },
    ["arrow", "rect", "text", "group"].map(it => {
      return h(
        "div",
        {
          key: it,
          className: createClass(it),
          onClick: () => props.onSelectTool(it)
        },
        it[0].toUpperCase()
      )
    })
  );
}
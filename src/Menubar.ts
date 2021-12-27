import { createElement as h } from 'react';

import { ToolType } from "./KonvaBuilder";

export default function( props: { selectedTool: string; onSelectTool: (key: ToolType) => void } ) {
  function createClass(key: string) {
    return key === props.selectedTool ? "tool selected" : "tool";
  }
  const tools: ToolType[] =  ["arrow", "rect", "text", "group"];
  return h(
    "div", 
    { 
      className: "menubar", 
      key: "menubar" 
    },
    tools.map(it => {
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
import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint, ColumnNode, RowNode, TextEditNode } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    const expr: PilNodeExpression<TextEditNode> = {
      definition: {
        id: "textedit",
        state: "active",
        states: [],
        mouseArea: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          customEvents: {},
          listeners: {}
        },
        type: "TextEdit",
        x: 0,
        y: 0,
        width: 300,
        height: 50,
        draw: true
      },
      props: {
        x: { value: 10, context: "", def: "" },
        y: { value: 10, context: "", def: "" },
        width: { value: 300, context: "", def: "" },
        height: { value: 50, context: "", def: "" }
      },
      eventHandlers: {}
    };

    if (canvas.current) {
      init(expr).then(instance => {
        (window as any).instance = instance;
        return mount(instance, "#mountpoint").then(paintreqs => {
          return paint(paintreqs); 
        })
      }).catch(err => {
        console.error(`Failed to initialize expression, ${expr}`, err);
      });
    }
  }, [canvas]);

  return (
    <canvas
      id="mountpoint" 
      width="700" 
      height="500"
      style={{ border: 'solid 1px' }}
      ref={canvas}
    >
    </canvas>
  );
}
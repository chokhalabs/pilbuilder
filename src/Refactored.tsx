import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint, ColumnNode } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    const item: ColumnNode = {
      type: "Column",
      id: "1",
      x: { value: 10, context: "", def: "" },
      y: { value: 10, context: "", def: "" },
      width: { value: 300, context: "", def: "" },
      height: { value: 450, context: "", def: "" },
      draw: true,
      children: {
        "messagelist": {
          definition: "./GenericItem",
          props: {
            x: { value: 11, context: "parent", def: "x + 1" },
            y: { value: 11, context: "parent", def: "y + 1" },
            width: { value: 298, context: "parent", def: "width - 2" },
            height: { value: 418,  context: "parent", def: "height -2" },
            draw: { value: true, context: "", def: "" }
          },
          eventHandlers: {}
        },
        "typingarea": {
          definition: "./GenericItem",
          props: {
            x: { value: 11, context: "parent", def: "x + 1" },
            y: { value: 430, context: "parent", def: "y + 1" },
            width: { value: 298, context: "parent", def: "width - 2" },
            height: { value: 28,  context: "parent", def: "height -2" },
            draw: { value: true, context: "", def: "" }
          },
          eventHandlers: {}
        }
      },
    };

    const expr: PilNodeExpression<ColumnNode> = {
      definition: item,
      props: {},
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
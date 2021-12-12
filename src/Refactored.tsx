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
          definition: "http://localhost:3000/GenericItem.js",
          props: {
            id: { value: "messagelist", context: "", def: "" },
            x: { value: 11, context: "parent", def: "" },
            y: { value: 11, context: "parent", def: "" },
            width: { value: 50, context: "parent", def: "" },
            height: { value: 50,  context: "parent", def: "" },
            draw: { value: true, context: "", def: "" }
          },
          eventHandlers: {}
        },
        "typingarea": {
          definition: "http://localhost:3000/GenericItem.js",
          props: {
            id: { value: "typingarea", context: "", def: "" },
            x: { value: 11, context: "parent", def: "" },
            y: { value: 70, context: "parent", def: "" },
            width: { value: 50, context: "parent", def: "" },
            height: { value: 50,  context: "parent", def: "" },
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
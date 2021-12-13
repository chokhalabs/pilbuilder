import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint, ColumnNode, RowNode } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    // const expr: PilNodeExpression<ColumnNode> = {
    //   definition: "http://localhost:3000/ChatBox.js",
    //   props: {
    //     x: { value: 10, context: "", def: "" },
    //     y: { value: 10, context: "", def: "" },
    //     width: { value: 300, context: "", def: "" },
    //     height: { value: 450, context: "", def: "" }
    //   },
    //   eventHandlers: {}
    // };

    const expr: PilNodeExpression<RowNode> = {
      definition: {
        id: "row",
        type: "Row",
        x: 10,
        y: 10,
        width: 300,
        height: 50,
        children: {
          "textedit": {
            definition: "http://localhost:3000/GenericItem.js",
            props: {
              id: { value: "textedit", context: "", def: "" },
              x: { value: 0, context: "$parent", def: "$parent.x + 1" },
              y: { value: 0, context: "$parent", def: "$parent.y + 1" },
              width: { value: 0, context: "$parent", def: "$parent.width - 50" },
              height: { value: 0, context: "$parent", def: "$parent.height - 2" }
            },
            eventHandlers: {}
          },
          "button": {
            definition: "http://localhost:3000/GenericItem.js",
            props: {
              id: { value: "button", context: "", def: "" },
              x: { value: 0, context: "$parent", def: "$parent.width - 50 + 12" },
              y: { value: 0, context: "$parent", def: "$parent.y + 1" },
              width: { value: 0, context: "$parent", def: "48" },
              height: { value: 0, context: "$parent", def: "$parent.height - 2" }
            },
            eventHandlers: {}
          }
        },
        draw: true
      },
      props: {},
      eventHandlers:{}
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
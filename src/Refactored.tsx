import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint, ColumnNode, RowNode, TextEditNode, TextNode } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    const expr: PilNodeExpression<ItemNode> = {
      definition: {
        id: "message",
        type: "Item",
        x: 10,
        y: 10,
        width: 300,
        height: 100,
        draw: true,
        children: {
          userlabel: {
            definition: "http://localhost:3000/Text.js",
            props: {
              x: { value: 10, context: "$parent", def: "$parent.x + 10" },
              y: { value: 10, context: "$parent", def: "$parent.y + 10" },
              fontsize: { value: 50, context: "", def: "" },
              font: { value: "25px Cambria sans", context:  "", def: "" },
              text: { value: "G.G", context: "", def: "" },
            },
            eventHandlers: {}
          },
          username: {
            definition: "http://localhost:3000/Text.js",
            props: {
              x: { value: 10, context: "$parent", def: "$parent.x + 60" },
              y: { value: 10, context: "$parent", def: "$parent.y + 10" },
              fontsize: { value: 10, context: "", def: "" },
              font: { value: "10px Cambria sans", context:  "", def: "" },
              text: { value: "Gaurav Gautam", context: "", def: "" }
            },
            eventHandlers: {}
          },
          message: {
            definition: "http://localhost:3000/Text.js",
            props: {
              x: { value: 10, context: "$parent", def: "$parent.x + 60" },
              y: { value: 10, context: "$parent", def: "$parent.y + 30" },
              fontsize: { value: 10, context: "", def: "" },
              font: { value: "10px Cambria sans", context:  "", def: "" },
              text: { value: "Here is a message that I want  to send to someone.", context: "", def: "" }
            },
            eventHandlers: {}
          }
        },
        animations: [],
        mouseArea: {
          x: 0,
          y: 0,
          width: 0,
          height: 0,
          listeners: {},
          customEvents: {}
        },
        state: "default",
        states: [{
          name: "default",
          when: "",
          onEnter: [],
          propertyChanges: []
        }],
        images: []
      },
      props: {},
      eventHandlers: {},
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
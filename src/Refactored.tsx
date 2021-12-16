import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint, ColumnNode, RowNode, TextEditNode } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    const expr: PilNodeExpression<TextEditNode> = {
      definition: {
        id: "textedit",
        state: "inactive",
        states: [
          {
            name: "active",
            when: "activate",
            propertyChanges: [],
            onEnter: [{
              module: "http://localhost:3000/TextEdit.js",
              callback: "onActive"
            }]
          },
          {
            name: "inactive",
            when: "inactivate",
            propertyChanges: [],
            onEnter: [{
              module: "http://localhost:3000/TextEdit.js",
              callback: "onInactive"
            }]
          }
        ],
        mouseArea: {
          x: 0,
          y: 0,
          width: 300,
          height: 50,
          listeners: {},
          customEvents: {
            activate: {
              when: "mousedown",
              payload: ""
            },
            inactivate: {
              when: "mousedown:outside",
              payload: ""
            },
            change: {
              when: "mousedown:outside",
              payload: ""
            }
          }
        },
        type: "TextEdit",
        x: 0,
        y: 0,
        width: 300,
        height: 50,
        draw: false,
        value: "",
        currentEditedText: "",
        cursorPosition: 0,
        children: {
          cursor: {
            definition: "AnimatedLine",
            props: {
              x: { value: 0, context: "$parent", def: "$parent.cursorPosition" }
            },
            eventHandlers: {}
          }
        }
      },
      props: {
        x: { value: 10, context: "", def: "" },
        y: { value: 10, context: "", def: "" },
        width: { value: 300, context: "", def: "" },
        height: { value: 50, context: "", def: "" },
        value: { value: "some text", context: "", def: "" }
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
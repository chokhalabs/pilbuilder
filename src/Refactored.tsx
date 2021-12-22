import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint, ColumnNode, RowNode, TextEditNode, TextNode, ListNode } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    const expr: PilNodeExpression<ListNode> = {
      definition: {
        id: "messagelist",
        childModel: { value: [], def: "$parent", context: "$props.listData" },
        childComponent: "http://localhost:3000/Message.js",
        x: 10,
        y: 10,
        type: "List",
        draw: false
      },
      props: {
        listData: { def: "", context: "", value: [
          {
            userName: "Gaurav Gautam",
            userImage: "G.G",
            message: "First message is this one"
          },
          {
            userName: "Gaurav Gautam",
            userIamge:  "G.G",
            message: "Second message is this one"
          }
        ]}
      },
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
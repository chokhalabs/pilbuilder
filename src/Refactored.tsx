import { useRef, useEffect } from "react";

import { mount, init, ItemNode, PilNodeExpression, paint, ColumnNode, RowNode, TextEditNode } from "./design";

export default function() {
  const canvas = useRef(null); 

  useEffect(() => {
    const expr: PilNodeExpression<ItemNode> = {
      definition: "http://localhost:3000/ChatBox.js",
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
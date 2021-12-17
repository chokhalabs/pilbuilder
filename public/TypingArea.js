const typingarea = {
  id: "row",
  type: "Row",
  x: 10,
  y: 10,
  width: 300,
  height: 50,
  children: {
    "textedit": {
      definition: "http://localhost:3000/TextEdit.js",
      props: {
        id: { value: "textedit", context: "", def: "" },
        x: { value: 0, context: "$parent", def: "$parent.x + 1" },
        y: { value: 0, context: "$parent", def: "$parent.y + 1" },
        width: { value: 0, context: "$parent", def: "$parent.width - 50" },
        height: { value: 0, context: "$parent", def: "$parent.height - 2" },
        value: { value: "start typing", context: "", def: "" }
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
};

export default typingarea;

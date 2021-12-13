const Chatbox = {
  type: "Column",
  id: "chatbox",
  x: 10,
  y:  10,
  width:  300,
  height:  450,
  draw: true,
  children: {
    "messagelist": {
      definition: "http://localhost:3000/GenericItem.js",
      props: {
        id: { value: "messagelist", context: "", def: "" },
        x: { value: 11, context: "$parent", def: "$parent.x + 1" },
        y: { value: 11, context: "$parent", def: "$parent.y + 1" },
        width: { value: 50, context: "$parent", def: "$parent.width - 2" },
        height: { value: 50,  context: "$parent", def: "$parent.height - 40" },
        draw: { value: true, context: "", def: "" }
      },
      eventHandlers: {}
    },
    "typingarea": {
      definition: "http://localhost:3000/TypingArea.js",
      props: {
        id: { value: "typingarea", context: "", def: "" },
        x: { value: 11, context: "$parent", def: "$parent.x + 1" },
        y: { value: 70, context: "$parent", def: "$parent.height - 26" },
        width: { value: 50, context: "$parent", def: "$parent.width - 2" },
        height: { value: 50,  context: "", def: "30" },
        draw: { value: true, context: "", def: "" }
      },
      eventHandlers: {}
    }
  },
};

export default Chatbox;

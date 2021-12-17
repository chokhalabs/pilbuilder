const textEdit = {
  id: "textedit",
  state: "inactive",
  states: [
    {
      name: "active",
      when: "activate",
      propertyChanges: [],
      onEnter: [{
        module: "http://localhost:3000/TextEditDeps.js",
        callback: "onActive"
      }]
    },
    {
      name: "inactive",
      when: "inactivate",
      propertyChanges: [],
      onEnter: [{
        module: "http://localhost:3000/TextEditDeps.js",
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
};

export default textEdit;

const def = {
  type: "Item",
  id: "genericItem",
  x: { value: 10, context: "", def: "" },
  y: { value: 10, context: "", def: "" },
  width: { value: 300, context: "", def: "" },
  height: { value: 450, context: "", def: "" },
  draw: true,
  children: {},
  mouseArea: {
    x: { value: 10, context: "", def: "" },
    y: { value: 10, context: "", def: "" },
    width: { value: 300, context: "", def: "" },
    height: { value: 450, context: "", def: "" },
    listeners: {},
    customEvents: {},
  },
  state: "default",
  states: [{
    name: "default",
    when: "mousedown",
    onEnter: [],
    propertyChanges: []
  }],
  images: []
};

export default def;
export const a = {
  id: "myButton_Symbol",
  type: "Item",
  width: 115,
  height: 100,
  x: 0,
  y: 0,
  draw: false,
  state: "normal",
  images: [],
  mouseArea: {
    id: "mouseArea",
    x: 0,
    y: 0,
    width: 115,
    height: 100,
    hoverEnabled: false,
    mousedown: true,
    mouseup: true,
    draw: false
  },
  states: [
    {
      name: "normal",
      when: "mouseup",
      propertyChanges: []
    },
    {
      name: "pressed",
      when: "mousedown",
      propertyChanges: []
    }
  ],
  children: {
    text1: {
      type: "Text",
      id: "text1",
      width: 100,
      text: "Some text here",
      color: "#000000",
      children: null
    },
    text2: {
      type: "Text",
      id: "text2",
      width: 100,
      text: "Some other text here",
      color: "#FF0000",
      children: null
    }
  }
};

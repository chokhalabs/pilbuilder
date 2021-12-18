const btn = {
  id: "button",
  type: "Item",
  x: 10,
  y: 10,
  width: 50,
  height: 50,
  draw: true,
  images: [
    {
      id: "normalstateimage",
      source: "http://localhost:3000/normal.png",
      visible: true,
      downloaded: null
    },
    {
      id: "pressedstateimage",
      source: "http://localhost:3000/pressed.png",
      visible: false,
      downloaded: null
    }
  ],
  state: "normal",
  states: [
    {
      name: "normal",
      when: "release",
      propertyChanges: [
        {
          target: "normalstateimage",
          visible: true
        },
        {
          target: "pressedstateimage",
          visible: false
        }
      ],
      onEnter: []
    },
    {
      name: "pressed",
      when:"press",
      propertyChanges: [
        {
          target: "normalstateimage",
          visible: false
        },
        {
          target: "pressedstateimage",
          visible: true
        }
      ],
      onEnter: []
    }
  ],
  mouseArea: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    listeners: {},
    customEvents: {
      press: {
        when: "mousedown",
        payload: ""
      },
      release: {
        when: "mouseup",
        payload: ""
      }
    }
  },
  children: {},
  animations: []
}

export default btn;

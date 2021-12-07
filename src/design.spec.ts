import { init, ItemNode, PilNodeExpression } from "./design";

it("Instantiating item", () => {
  const item: ItemNode = {
    type: "Item",
    id: "1",
    x: { value: 0, context: "", def: "" },
    y: { value: 0, context: "", def: "" },
    width: { value: 0, context: "", def: "" },
    height: { value: 0, context: "", def: "" },
    draw: false,
    mouseArea: {
      x: { value: 0, context: "", def: "" },
      y: { value: 0, context: "", def: "" },
      width: { value: 0, context: "", def: "" },
      height: { value: 0, context: "", def: "" },
      listeners: {},
      customEvents: {}
    },
    children: {},
    state: "default",
    states: [],
    images: []
  };

  const expr: PilNodeExpression<ItemNode> = {
    definition: item,
    props: {},
    eventHandlers: {}
  };

  const instance = init(expr);
});
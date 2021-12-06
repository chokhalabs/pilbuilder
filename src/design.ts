import { assertNever } from "./pilBase";

type Expression<T> = { def: string; context: string; value: T; };
type ImportableModulePath = string;

type evaluate<T> = (ex: Expression<T>) => T;

type MouseArea = {
  x: Expression<number>;
  y: Expression<number>;
  width: Expression<number>;
  height: Expression<number>;
  listeners: Record<string, Array<{
    handler: (ev: MouseEvent) => void;
    eventLocationChecker: (ev: MouseEvent) => boolean;
  }>>;
  customEvents: Record<string, {
    when: string; // name of a state
    payload: any;
  }>;
};

interface BaseNodeDef {
  id: string;
}

interface PositionedNodeDef {
  x: Expression<number>;
  y: Expression<number>;
  width: Expression<number>;
  height: Expression<number>;
  draw: boolean;
}

interface MouseEnabledNodeDef {
  mouseArea: MouseArea;
}

interface ContainerNodeDef {
  children: Record<string, PilNodeExpression<PilNodeDef>>;
}

function isContainerNode(node: Partial<PilNodeDef>): node is ContainerNodeDef {
  if (node.type === "Item") {
    return !!node.children;
  } else {
    return false;
  }
}

interface EventemitterNodeDef {
  events: {
    when: Expression<boolean>;
    payload: Expression<any>;
  };
}

interface ImagedNode {
  images: Array<{
    source: string;
  }>;
}

interface StatefulNodeDef {
  state: string;
  states: Array<{
    name: string;
    when: string;
    onEnter: Array<{ module: ImportableModulePath; callback: string; }>;
    propertyChanges: Array<{
      target: string;
      [k: string]: string | number | boolean;
    }>;
  }>;
}

type ItemNode = { type: "Item" } & BaseNodeDef & PositionedNodeDef & MouseEnabledNodeDef & ContainerNodeDef & EventemitterNodeDef & StatefulNodeDef & ImagedNode;
type TextNode = { type: "Text", text: string; color: string; font: string; fontsize: number; } & BaseNodeDef;
type TextEditNode = { type: "TextEdit" } & BaseNodeDef & PositionedNodeDef & MouseEnabledNodeDef & EventemitterNodeDef & StatefulNodeDef;
type ColumnNode = { type: "Column" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;
type RowNode = { type: "Row" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;
type VertScrollNode = { type: "VertScroll" } & BaseNodeDef & ContainerNodeDef & PositionedNodeDef;

type PilNodeDef = ItemNode | TextNode | TextEditNode | ColumnNode | VertScrollNode | RowNode;

// Used when making new PilNodeDefs
interface PilNodeExpression<T extends PilNodeDef> {
  definition: T;
  props: Record<string, Expression<any>>;
  eventHandlers: Record<string, {
    emitName: string;
    payloadTransformer: {
      module: ImportableModulePath;
      callback: string;
    }
  }>;
}

interface EventBus {
  listeners: Record<string, Array<(payload: any) => void>>;
  // on: (bus: EventBus, eventname: string, listener: (payload: any) => void) => EventBus;
  // off: (bus: EventBus, eventname: string, listener: (payload: any) => void) => EventBus;
  // emit: (bus: EventBus, eventname: string, payload: any) => void;
};

export function emit(bus: EventBus, eventname: string, payload: any) {
  if (bus.listeners[eventname]) {
    bus.listeners[eventname].forEach(cb => {
      cb.call(null, [payload]);
    });
  } else {
    console.error(`No eventlisteners for ${eventname} on the bus`);
  }
}

interface PilNodeInstance<T extends PilNodeDef> {
  node: T;
  expr: PilNodeExpression<T>;
  eventBus: EventBus;
  children: T extends ItemNode ? Record<string, PilNodeInstance<PilNodeDef>> : null;
}

interface MountedInstance<T extends PilNodeDef> extends PilNodeInstance<T> {
  renderingTarget: PilRenderingContext;
}

interface PilRenderingContext {
  canvas: HTMLCanvasElement;
  context: CanvasRenderingContext2D;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PaintRequest<T extends PilNodeDef> {
  inst: MountedInstance<T>;
  timestamp: number;
}

// type initPil<T extends PilNodeDef> = (nodeDef: T) => PilNodeInstance<T>;
type paint<T extends PilNodeDef> = (reqs: PaintRequest<T>[]) => Promise<void>;
type activateState = (node: PilNodeInstance<PilNodeDef>, state: string) => PaintRequest<PilNodeDef>;
type bindProps<T extends PilNodeDef> = (node: PilNodeInstance<T>, prop: string, value: string|boolean|number) => PaintRequest<T>;

export function deliverMouseDown(inst: MountedInstance<PilNodeDef>, ev: MouseEvent) {
  switch (inst.node.type) {
    case "Item":
      const mousedowntargets = inst.node.mouseArea.listeners["mousedown"];
      mousedowntargets.forEach(listener => {
        if (listener.eventLocationChecker(ev)) {
          listener.handler(ev);
        } else {
          console.info(`Ignore mousedown on ${inst.node}`);
        }
      });
      break;
    case "VertScroll":
    case "TextEdit":
    case "Text":
    case "Row":
    case "Column":
      console.info(`Cannot deliver mousedown event to ${inst.node}`);
      break;
    default:
      assertNever(inst.node);
  }
}

export function mount(inst: PilNodeInstance<PilNodeDef>, canvasid: string): Promise<MountedInstance<PilNodeDef>> {
  return new Promise((res, rej) => {
    const canvas: HTMLCanvasElement|null = document.querySelector(canvasid);
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        const mountedInst: MountedInstance<PilNodeDef> = {
          ...inst,
          renderingTarget: {
            canvas,
            context,
            x: 0,
            y: 0,
            width: canvas.width,
            height: canvas.height
          }
        }
        canvas.addEventListener("mousedown", ev => {
          deliverMouseDown(mountedInst, ev);
        });
        res(mountedInst);
      } else {
        rej("Could not obtain context");
      }
    } else {
      rej("Could not get canvas");
    }
  })
}

function activateState(inst: PilNodeInstance<ItemNode>, state: string) {
  const targetState = inst.node.states.find(st => st.name === state);
  if (targetState) {
    inst.node.state = state;
  } else {
    throw new Error(`Cannot activate ${state} on ${inst.node}`);
  }
}

function isItemNodeExpression(expr: PilNodeExpression<PilNodeDef>): expr is PilNodeExpression<ItemNode> {
  if (expr.definition.type === "Item") {
    return true;
  } else {
    return false;
  }
}

function setupMouseArea(inst: PilNodeInstance<ItemNode>): PilNodeInstance<ItemNode> {
  inst.node.mouseArea.listeners = {
    mousedown: [
      {
        handler(ev) {
          // activate state if inst.node has a matching when clause
          const targetState = inst.node.states.find(state => state.when === "mousedown");
          if (targetState && inst.node.state !== targetState.name) {
            activateState(inst, targetState.name);
          }
          // emit event if mouseArea is supposed to emit custom events
          Object.keys(inst.node.mouseArea.customEvents).map(event => {
            if (inst.node.mouseArea.customEvents[event].when === "mousedown") {
              emit(inst.eventBus, event, inst.node);
            }
          })
        },
        eventLocationChecker(ev) {
          const mouseAreaRect = { 
            x: inst.node.mouseArea.x.value,
            y: inst.node.mouseArea.y.value, 
            width: inst.node.mouseArea.width.value, 
            height: inst.node.mouseArea.height.value 
          };

          if (pointIsInRect(ev, mouseAreaRect)) {
            return true;
          } else {
            return false;
          }
        }
      }
    ]
  };
  return inst;
}

function pointIsInRect(point: {x: number; y: number;}, rect: { x: number; y: number; width: number; height: number; }): boolean {
  return point.x >= rect.x &&
    point.y >= rect.y &&
    point.x <= rect.x + rect.width,
    point.y <= rect.y + rect.height;
}

/*
function setupEventEmitters(inst: PilNodeInstance<ItemNode>, parent: PilNodeInstance<ItemNode>): PilNodeInstance<ItemNode> {
  Object.keys(inst.expr.eventHandlers).forEach(event => {
    inst.eventBus.listeners[event] = payload => {
      parent.eventBus.emit(inst.expr.eventHandlers[event].emitName, payload);
    }
  })
  return inst;
}
*/

export function init(expr: PilNodeExpression<ItemNode>, parentInst?: PilNodeInstance<ItemNode>):PilNodeInstance<ItemNode>; 
export function init(expr: PilNodeExpression<PilNodeDef>, parentInst?: PilNodeInstance<PilNodeDef>) {
  if (isItemNodeExpression(expr)) {
    const children: Record<string, PilNodeInstance<PilNodeDef>> = {};
    let instance: PilNodeInstance<ItemNode> = {
      node: expr.definition,
      expr,
      eventBus: {
        listeners: {}
      },
      children 
    };

    // setup mousearea
    instance = setupMouseArea(instance);
    // setup eventEmitters if expression has eventHandlers object
    /*
    if (parentInst) {
      instance = setupEventEmitters(instance);
    }
    */
    // bind props
    // Instantiate children
    /*
    for (let child in instance.children) {
      children[child] = init(instance.children[child], instance);
    }
    */
    return instance;
  } else {
    throw new Error("Cannot instantiate expression: " + expr.definition.type); 
  }
}

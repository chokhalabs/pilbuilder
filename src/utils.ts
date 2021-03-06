// import { Rect, Text, Group } from 'react-konva';
import { createElement as h } from 'react';
import * as Components from "./KonvaPrimitives";

type SimpleValueBinding = {
  expr: string;
  evaluator: "pickSuppliedProp";
  default: string | number | boolean | Record<string, string|number|boolean> | ((...args: any[]) => any) | Array<string|number|boolean|Record<string, string|number|boolean>>;
  map: boolean;
};

type GeneratedFuncBinding = {
  expr: Array<any>;
  evaluator: "makeClipFunc";
  default: string | number | boolean | Record<string, string|number|boolean> | ((...args: any[]) => any) | Array<string|number|boolean|Record<string, string|number|boolean>>;
  map: boolean;
}

export type BindingExpression = SimpleValueBinding | GeneratedFuncBinding;
export type PropVal = number|boolean|string|((...args: any[]) => any)|BindingExpression;
export type PropExprs = Record<string, PropVal>;

export interface Config {
  id: string;
  name: string | null;
  type: "Group" | "Rect" | "Text" | "LayoutGroup" | null;
  props: PropExprs | null; 
  children: Config[];
}

export function assertNever(arg: never): never {
  throw new Error("arg should never happen!")
}

export type ToolType = "arrow" | "rect" | "text" | "group" | "layoutgroup";

function evaluateProps($props: Record<string, any>, propsExprs: PropExprs) {
  const evaluated: Record<string, any> = {...propsExprs};
  Object.keys(propsExprs).forEach(key => {
    const propval = propsExprs[key];
    if (typeof propval === "object") {
      switch(propval.evaluator) {
        case "makeClipFunc":
          const functionBodySpec = propval.expr;
          evaluated[key] = (ctx: CanvasRenderingContext2D) => {
            functionBodySpec.forEach((shapeConfig: { shape: "Rect", props: { x: number; y: number; width: number; height: number; } }) => {
              ctx.rect(shapeConfig.props.x, shapeConfig.props.y, shapeConfig.props.width, shapeConfig.props.height);
            })
          }
          break;
        case "pickSuppliedProp":
          {
            let suppliedVal = $props[propval.expr.substring("$props.".length)];
            if (suppliedVal === undefined) {
              console.error("Value not supplied for " + propval.expr);
              suppliedVal = propval.default;
            }
            evaluated[key] = suppliedVal;
          }
          break;
        default:
          console.error("Unrecognized prop setting: ", propval);
          assertNever(propval);
      }
    }
  });
  return evaluated;
}

export function findNodeById(id: string, forest: Config[]) {
  for (let i = 0; i < forest.length; i++) {
    const tree = forest[i];
    const node = traverse(tree, id);
    if (node) return node;
  }
}

// Traverse the children of a node and find the childnode with the 
// required id, or look at its children recursively for the same
function traverse(cursor: Config, id: string): Config|undefined {
  if (cursor.id === id) {
    return cursor;
  } else {
    const candidates = cursor.children.map(child => traverse(child, id));
    return candidates.find(c => !!c)
  }
}

function transformNamedComponent(config: Config, $props: PropExprs, injectedMapIndex?: number): any {
  if (config.name === null) {
    return null;
  } else {
    let resolvedConfig: any = null;
    const component: Config = JSON.parse(JSON.stringify((Components as any)[config.name]));
    component.id = config.id;
    let injectedProps = {};
    if (injectedMapIndex !== undefined) {
      if (config.props?.in && typeof config.props?.in === "object") {
        // TODO: expect that in will not always be mapped and hence will not always be an array
        injectedProps = config.props?.in?.default[injectedMapIndex];
      }
    } else {
      injectedProps = config.props?.in?.default;
    }
    
    // const injectedProps: any = config.props?.in || {};
    // TODO: handle map and evaluator
    // if (injectedProps.map) {
    //   const defaultValues = injectedProps.default[0];
    //   rendered.push(
    //     transformToVDOM(component, { 
    //       ...$props, 
    //       ...defaultValues
    //     })
    //   );
    // } else {

    // }
    resolvedConfig = component;
    return { resolvedConfig, injectedProps };
  }
}

export function transformToVDOM(config: Config, $props: PropExprs): any {
  let props: PropExprs|null = null;
  let mappedProps: string[] = [];
  if (config.props) {
    props = evaluateProps($props, config.props);
    // If config has more than one mapped props then choose only one to map over and print an error 
    // telling that only one mapped prop is allowed per component
    mappedProps = Object.keys(props).filter(key => {
      const prop = (props || {})[key];
      return (typeof prop === "object") && prop.map;
    });
    if (mappedProps.length > 1) {
      console.error("There are multiple mapped props in the ccomponent which is not allowed!", config, $props, mappedProps);
    }
  }
  return function() {
    // If there is a mapped prop then return a group with one component per item in the mapped prop
    if (mappedProps.length === 0) {
      const children = config.children.map(child => h(transformToVDOM(child, $props), { key: child.id }));
      if (config.type) {
        return h(
          config.type,
          { 
            ...props,
            id: config.id
          },
          children
        );
      } else {
        const { resolvedConfig, injectedProps } = transformNamedComponent(config, $props);
        return h(transformToVDOM(resolvedConfig, { ...$props, ...injectedProps }));
        // return h("Text", { text: "Cannot render named component" });
      }
      
    } else {
      const mappedPropKey = mappedProps[0];
      const mappedProp: any[] = (props && props[mappedPropKey] || []) as any[];
      if (!Array.isArray(mappedProp)) {
        console.error("Did not get array in mappedProp!", mappedProp, mappedPropKey);
      }
      const children = config.children.map(child => h(transformToVDOM(child, $props), { key: child.id }));
      return mappedProp.map((item, i) => {
        if (config.type) {
          return h(
            config.type,
            {
              ...props,
              [mappedPropKey]: item,
              id: config.id + i
            },
            children
          );
        } else {
          const { resolvedConfig, injectedProps } = transformNamedComponent(config, $props, i);
          return h(transformToVDOM(resolvedConfig, {...$props, ...injectedProps}));
          // return h("Text", { text: "Cannot render named component" });
        }
        
      });
    }
  }
}

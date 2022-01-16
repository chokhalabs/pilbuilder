// import { Rect, Text, Group } from 'react-konva';
import { createElement as h } from 'react';

export type BindingExpression = {
  expr: string;
  default: string | number | boolean | Record<string, string|number|boolean> | ((...args: any[]) => any) | Array<string|number|boolean|Record<string, string|number|boolean>>;
  map: boolean;
};

type PropExprs = Record<string, number|boolean|string|((...args: any[]) => any)|BindingExpression>;

export interface Config {
  id: string;
  type: "Group" | "Rect" | "Text" | "LayoutGroup";
  props: PropExprs|null; 
  children: Config[];
}

export interface Component {
  name: string;
  config: Config;
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
      if ($props[propval.expr.substring("$props.".length)]) {
        // evaluated[key] = eval(propval.expr);
        evaluated[key] = $props[propval.expr.substring("$props.".length)];
      } else {
        evaluated[key] = propval.default;
      }
    }
  });
  return evaluated;
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
      return h(
        config.type,
        { 
          ...props,
          id: config.id
        },
        children
      );
    } else {
      const mappedPropKey = mappedProps[0];
      const mappedProp: any[] = (props && props[mappedPropKey] || []) as any[];
      if (!Array.isArray(mappedProp)) {
        console.error("Did not get array in mappedProp!", mappedProp, mappedPropKey);
      }
      const children = config.children.map(child => h(transformToVDOM(child, $props), { key: child.id }));
      return mappedProp.map((item, i) => h(
        config.type,
        {
          ...props,
          [mappedPropKey]: item,
          id: config.id + i
        },
        children
      )) 
    }
  }
}

import { createElement as h } from "react";
import { Config, BindingExpression, PropVal } from "./utils";

type DetailsProps = {
  node: Config | null,
  onNodeUpdate: (key: string, value: any) => void
};

function editNumber(props: { label: string; value: number; onChange: (key: string, value: number) => void, isProvided: boolean }) {
  return h(
    "div", 
    {
      className: "numberfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "number",
          onChange: ev => props.onChange(props.label, parseFloat(ev.target.value))
        }
      )
    ] 
  );
}

function editColor(props: { label: string; value: string; onChange: (key: string, value: string) => void, isProvided: boolean }) {
  return h(
    "div", 
    {
      className: "colorfield"
    },
    [
      h(
        "div",
        {},
        props.label
      ),
      h(
        "input",
        {
          value: props.value,
          type: "color",
          onChange: ev => props.onChange( props.label, ev.target.value)
        }
      )
    ] 
  );
}

function editText(props: { label: string; value: string; defaultValue: string | string[], onChange: (key: string, value: string | BindingExpression) => void; isProvided: boolean} ) {
  const editor = h(
    "div", 
    {
      className: "boundfield"
    }, 
    h(
      "div",
      {},
      props.label
    ),
    h(
      "input",
      {
        value: props.isProvided ? props.value.substring("$props.".length) : props.value,
        type: "text",
        onChange: ev => props.onChange(
          props.label, 
          props.isProvided ? { 
            expr: "$props." + ev.target.value, 
            default: props.defaultValue, 
            map: false,
            evaluator: "pickSuppliedProp"
          } : ev.target.value
        )
      }
    ),
    h(
      "input", 
      { 
        type: "checkbox", 
        checked: props.isProvided, 
        onChange: ev => {
          if (ev.target.checked) {
            if (!props.defaultValue) {
              props.defaultValue = "default " + props.value.substring("$props.".length);
            }
            props.onChange(props.label, { 
              expr: "$props." + props.value, 
              default: props.defaultValue, 
              evaluator: "pickSuppliedProp",
              map: false 
            })
          } else {
            props.onChange(props.label, props.value)
          }
        } 
      }
    )
  );

  let inputs = h(
    "input",
    {
      placeholder: "Default value",
      value: props.defaultValue,
      onChange: ev => {
        props.onChange(props.label, { 
          expr: props.value, 
          default: ev.target.value, 
          map: false,
          evaluator: "pickSuppliedProp"
        })
      }
    }
  );

  if (Array.isArray(props.defaultValue)) {
    let arrayItems = props.defaultValue.map((val, i) => {
      return h(
        "input",
        {
          placeholder: "Default value",
          value: val,
          onChange: ev => {
            let newDefaults: string[] = [];
            if (Array.isArray(props.defaultValue)) {
              newDefaults = [...props.defaultValue]
              newDefaults.splice(i, 1, ev.target.value);
            }
            props.onChange(props.label, { 
              expr: props.value, 
              default: newDefaults, 
              map: true,
              evaluator: "pickSuppliedProp"
            })
          }
        }
      )
    });
    inputs = h(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column"
        }
      },
      arrayItems
    )
  }

  const defaultValue = h(
    "div",
    {},
    h(
      "div",
      {},
      "default"
    ),
    h(
      "div",
      {
        style: { display: "flex" }
      },
      inputs,
      h(
        "button",
        {
          onClick: () => {
            let defaultValues: string[] = [];
            if (Array.isArray(props.defaultValue)) {
              defaultValues = defaultValues.concat(props.defaultValue);
            } else {
              defaultValues.push(props.defaultValue);
            }
            defaultValues.push("new")
            props.onChange(props.label, { 
              expr: props.value, 
              default: defaultValues, 
              map: true,
              evaluator: "pickSuppliedProp"
            })
          }
        },
        "+"
      )
    )
  );

  return h(
    "div", 
    {
      className: "textfield"
    },
    editor,
    h("hr"),
    props.isProvided ? defaultValue : null 
  );
}

function resolveEditorType(propkey: string, propval: PropVal | null, onNodeUpdate: DetailsProps["onNodeUpdate"]): ReturnType<typeof h> {
  if (propkey === "fill") {
    return editColor({ 
      label: propkey, 
      value: propval as any, // fill is always string
      onChange: onNodeUpdate,
      isProvided: false
    });
  } else if (typeof propval === "number") {
    return editNumber({
      label: propkey,
      value: propval,
      onChange: onNodeUpdate,
      isProvided: false
    });
  } else if (typeof propval === "string") {
    return editText({
      label: propkey,
      value: propval,
      defaultValue: "", 
      onChange: onNodeUpdate,
      isProvided: false
    });
  } else if (typeof propval === "object" && propval && propval.evaluator === "pickSuppliedProp") {
    let defaultValue: string|string[];
    if (typeof propval.default === "string") {
      defaultValue = propval.default;
    } else if (Array.isArray(propval.default)) {
      defaultValue = propval.default as string[];
    } else {
      defaultValue = (propval.default || "").toString();
    }
    return editText({
      label: propkey,
      value: propval.expr as any,
      defaultValue,
      onChange: onNodeUpdate,
      isProvided: true
    });
  } else {
    console.error("Cannot make an editor for prop: ", propkey, propval);
    return h("div", {}, "Cannot edit: " + propkey);
  }
}

function makePropEditors(props: Config["props"], propEditors: Array<ReturnType<typeof h>>, onNodeUpdate: DetailsProps["onNodeUpdate"]) {
  if (props) {
    Object.keys(props).forEach(propkey => {
      const propval = props[propkey];
      propEditors.push(resolveEditorType(propkey, propval, onNodeUpdate)) 
    });
  }
}

function getBindableProps(props: Config["props"]): Config["props"] {
  if (props) {
    const bindablePropKeys = Object.keys(props).filter(key => props && props[key] && typeof props[key] === "object");
    const bindableProps = bindablePropKeys.reduce((bprops: any, key) => {
      bprops[key] = props && props[key];
      return bprops;
    }, {});
    return bindableProps;
  } else {
    return null;
  }
}

function getBindablePropsInComponent(node: Config, propEditors: any[], onNodeUpdate: any) {
  const bindableProps = getBindableProps(node.props);
  makePropEditors(bindableProps, propEditors, onNodeUpdate);
  node.children.forEach(child => {
    getBindablePropsInComponent(child, propEditors, onNodeUpdate);
  });
}

export default function (props: DetailsProps) {
  let body = h("div", {}, "Select a node to edit its properties!");
  if (props.node) {
    const node = props.node;
    let propEditors: Array<ReturnType<typeof h>> = [];

    // If config is a named component only show props that are bindable expressions
    if (node.name) {
      getBindablePropsInComponent(node, propEditors, props.onNodeUpdate); 
    } else {
      makePropEditors(node.props, propEditors, props.onNodeUpdate);
    }
     

    body = h(
      "div",
      {},
      propEditors
    )
  }

  return h(
    "div",
    {
      className: "detailsbar"
    },
    body 
  );
}
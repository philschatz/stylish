enum Settings {
  REQUIRED,
  OPTIONAL
};

type CSSProperty = {
  name: string; 
  value: string | Settings;
};

// Components
abstract class Component {
  subSelector?: string;
  protected defined: CSSProperty[] = [];

  addDefined(params: any): void {
    // parses params given as an object into CSSProperties and adds to `defined`
    // (pretty gnarly)
    let param_str: string = JSON.stringify(params);
    let keys: string[] | undefined = param_str.match(/"[\w]*":/g)?.map((val) => {
        return val.replaceAll('\"', '').replaceAll('_', '-').replace(':', '');
    });
    let vals: string[] | undefined = param_str.match(/:"[\w\s]*"/g)?.map((val) => { // TODO: allow hex colors thru, other data
        return val.replace(':', '').replaceAll('\"', '');
    });
    if (keys !== undefined && vals !== undefined) {
      for (let i = 0; i < keys.length; i++) {
        this.defined.push({name: keys[i], value: vals[i]})
      }
    }
  }

  toCSS(parentSelector: string): string {
    // TODO: error if a value is still SETTINGS instead of string
    // also, validation of property names should go somewhere
    let css_values: string[] = this.defined.map((val) => {
      return `${this.defined[0].name}: ${this.defined[0].value};`
    });
    return `${parentSelector}${this.subSelector} {
      ${css_values.join('\n')};
    }`
  }
}

// Shapes
abstract class Shape {
  rootSelector: string;
  componentTree: any; // TODO: type this

  constructor(rootSelector: string) {
    this.rootSelector = rootSelector;
  }

  buildComponentTree() {
    // TODO: weave components (which are fields on the shape)
    // into a tree by setting parent & child attributes, and creating the full subselector (can be missing root)
  }

  toCSS() {
    // Traverses component tree
    // weaves subselectors & creates selector rule + params
    // calls buildComponentTree & each component's toCSS()
  }
}

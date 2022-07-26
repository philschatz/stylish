enum Settings {
  REQUIRED,
  OPTIONAL
};

abstract class Component {
  subSelector?: string;
  // abstract parent: Component;
  // abstract children: Component[];
  protected defined: Map<string, string | Settings> = new Map();

  abstract addDefined(params: any): void

  toCSS(parentSelector: string): string {
    // TODO: validation
    return `${parentSelector}${this.subSelector} ${JSON.stringify(this.defined)}`
  }
}

// How to organize the params for a component? 
// Can't define an interface within a component :/
interface note1Params {
  background_color: string | Settings;
  border_bottom: string | Settings;
  line_height?: string | Settings;
}

class Note1 extends Component {
  public constructor() {
    super()
    this.defined = new Map([
      ['color', 'green'], 
      ['font-family', 'monospace'],
      ['background-color', 'Settings.REQUIRED'], // why does Settings.REQUIRED error?
      ['border', 'Settings.OPTIONAL']
    ]);
    this.subSelector = ''
  }

  addDefined(params: note1Params): void {
    this.defined.set('background-color', params.background_color);
  }
  
  // addDefinedOptional(border: string): void {
  //   this.defined.set('border', border); // eg. 'solid 1px black'
  // }
}

class NoteTitle extends Component {
  public constructor() {
    super()
    this.defined = new Map([
      ['color', 'red']
    ])
    this.subSelector = '[data-type="title"]';
  }

  addDefinedRequired() {}
  addDefinedOptional() {}
};

abstract class Shape {
  rootSelector: string;

  constructor(rootSelector: string) {
    this.rootSelector = rootSelector;
  }

  buildComponentTree() {
    // TODO: weave components (which are fields on the shape)
    // into a tree by setting parent & child attributes.
    // Ideally some nice human-readable data would be passed in to do this
  }

  toCSS() {
    // Traverses component tree
    // weaves subselectors & creates selector rule + params
  }
}

// const noteShape = new Shape(new Note1());
// noteShape.noteTitle = new NoteTitle();

class NoteShape extends Shape {
  // Component list as params of the shape, so that autocomplete will work
  note1: Note1;
  noteTitle: NoteTitle;

  constructor(rootSelector: string) {
    super(rootSelector)
    this.note1 = new Note1();
    this.noteTitle = new NoteTitle();
    // Here the component list is given in ___ notation
    // and assembled into a tree
    
    this.buildComponentTree(
      // TODO: decide notation
      [this.note1, [
        this.noteTitle
      ]]
    )
  }
};

const noteShape = new NoteShape('[data-type="note"]');
noteShape.note1.addDefined({
  background_color: 'blue',

});
// noteShape.note1.addDefinedRequired('blue'); // bad
noteShape.note1.addDefinedRequired({
  background_color: 'blue', 
  border_bottom: 'solid 1px red', 
  line_height: '2'
});

// Another one
const noteShape1 = new NoteShape('div[data-type="note"].different-class');
noteShape.note1.addDefinedRequired({
  background_color: 'green', 
  border_bottom: 'double 2px blue'
});

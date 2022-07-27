// 1. components example
interface note1Params {
  background_color: string | Settings;
  border_bottom: string | Settings;
  line_height?: string | Settings;
}

class Note1 extends Component {
  public constructor() {
    super()
    this.defined = [
      { name: 'color', value: 'green' },
      { name: 'font-family', value: 'monospace' },
      { name: 'background-color', value: Settings.REQUIRED },
      { name: 'border', value: Settings.OPTIONAL },
    ]
    this.subSelector = ''
  }

  addDefined(params: note1Params): void {
    super.addDefined(params);
  }
}

class NoteTitle extends Component {
  public constructor() {
    super()
    this.defined = [
      { name: 'color', value: 'red' }
    ];
    this.subSelector = '[data-type="title"]';
  }

  // no addDefined -- no params to define!
  // TODO: enforce this so that addDefined can't be called?
};

// 2. shapes example
class NoteShape extends Shape {
  // Component list as params of the shape, so that autocomplete will work
  note1: Note1;
  noteTitle: NoteTitle;

  constructor(rootSelector: string) {
    super(rootSelector)
    // all components on the shape are class properties + instantiated in the tree
    // (lots of repetition...)
    this.componentTree = {
      'val': this.note1 = new Note1(),
      'children': [
        {'val': this.noteTitle = new NoteTitle()}
      ]
    };
  }
};


// 3. creating shapes, adding settings
const noteShape = new NoteShape('[data-type="note"]');
// add optional and required params
noteShape.note1.addDefined({
  background_color: 'blue', 
  border_bottom: 'solid 1px red', 
  line_height: '2'
});
// gives compile-time error if required params are not present!
// noteShape.note1.addDefined({
//   background_color: 'blue',
// });

// Another one, different selector
const noteShape1 = new NoteShape('div[data-type="note"].different-class');
noteShape.note1.addDefined({
  background_color: 'green', 
  border_bottom: 'double 2px blue'
  // optional param not needed!
});

noteShape.toCSS(); // generates CSS from component tree, errors if settings are unset
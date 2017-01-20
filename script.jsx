const React = require('react');
const ReactDOM = require('react-dom');
const Person = require('./person.jsx');
const Donate = require('./donate.jsx');

const rows = [];

for (let y = 0; y < 20; y++) {
  const row = [];
  for (let x = 0; x < 20; x++) {
    row.push(0);
  }
  rows.push(row);
}

const planDefaults = {
  rows,
  width: 20,
  height: 20,
  w: 300,
  h: 250,
  x: 20,
  y: 10
};

class Tiler extends React.Component {

  constructor(props) {
    super(props);

    const projectData = window.localStorage.getItem('project');
    if (projectData) {
      this.state = JSON.parse(projectData);
    } else {
      this.state = Object.assign({
        type: 0,
        person: false,
        showTileDefinitions: false,
        selected: -1,
        plans: [],
        tileSpec: `40 25 https://s27.postimg.org/kxmrvn54z/image.jpg
40 25 https://s30.postimg.org/jdmtfcg1d/image.jpg
40 25 https://s29.postimg.org/jrnfyfj7b/image.jpg
40 5 https://s27.postimg.org/hlan3nfk3/image.jpg`
      });
    }
  }

  componentDidUpdate() {
    window.localStorage.setItem('project', JSON.stringify(this.state));
  }

  componentWillMount() {
    if (this.state.plans.length) {
      this.setState({ selected: 0 });
    }
  }

  handleClick(x, y) {
    const plan = this.state.plans[this.state.selected];
    const rows = plan.rows.map(row => row.slice(0));
    rows[y][x] = this.state.type;
    this.setCurrentPlanState({ rows });
  }

  select(type) {
    this.setState({ type });
  }

  handleColClick(x) {
    const plan = this.state.plans[this.state.selected];
    const rows = plan.rows.map(row => row.slice(0));

    for (let y = 0; y < plan.height; y++) {
      rows[y][x] = this.state.type;
    }

    this.setCurrentPlanState({ rows });
  }

  handleRowClick(y) {
    const plan = this.state.plans[this.state.selected];
    const rows = plan.rows.map(row => row.slice(0));

    for (let x = 0; x < plan.width; x++) {
      rows[y][x] = this.state.type;
    }

    this.setCurrentPlanState({ rows });
  }

  g1() {
    const plan = this.state.plans[this.state.selected];
    const a = [];
    for (let i = 0; i < plan.width; i++) {
      a.push(<td key={i} onClick={this.handleColClick.bind(this, i)} className="col"/>);
    }
    return a;
  }

  g2() {
    const plan = this.state.plans[this.state.selected];
    const a = [];
    for (let y = 0; y < plan.height; y++) {
      a.push(
        <tr key={y}>
          <td onClick={this.handleRowClick.bind(this, y)} className="row"><div/></td>
          {this.g3(y)}
        </tr>
      );
    }
    return a;
  }

  g3(y) {
    const plan = this.state.plans[this.state.selected];
    const a = [];
    for (let x = 0; x < plan.width; x++) {
      a.push(
        <td key={x} onClick={this.handleClick.bind(this, x, y)}>
          <div className={'type-' + plan.rows[y][x]}/>
        </td>
      );
    }
    return a;
  }

  newPlan() {
    const planName = window.prompt('Plan name');
    if (planName) {
      const plans = [ ...this.state.plans, Object.assign({ name: planName }, planDefaults) ];
      const selected = plans.length - 1;
      this.setState(Object.assign({ plans, selected }));
    }
  }

  deletePlan() {
    if (window.confirm(`Are you sure to delete plan "${this.state.plans[this.state.selected].name}"?`)) {
      const i = this.state.selected;
      const plans = this.state.plans.slice(0);
      plans.splice(i, 1);
      this.setState({ plans, selected: plans.length - 1 });
    }
  }

  setPlan(e) {
    this.setState({ selected: parseInt(e.target.value) });
  }

  change(what, e) {
    const value = parseInt(e.target.value);
    this.setCurrentPlanState({ [ what ]: isNaN(value) ? 0 : value });
  }

  setCurrentPlanState(values) {
    const plan = Object.assign({}, this.state.plans[this.state.selected], values);
    const plans = [ ...this.state.plans ];
    plans[this.state.selected] = plan;
    this.setState({ plans });
  }

  togglePerson() {
    this.setState({ person: !this.state.person });
  }

  handleTileSpecChange(e) {
    this.setState({ tileSpec: e.target.value });
  }

  handleLoadClick() {
    const { file } = this.refs;
    file.style.display = '';
    file.focus();
    file.click();
    file.style.display = 'none';
  }

  load() {
    const file = this.refs.file.files[0];
    if (!file) {
      window.alert('Please select a project file first.');
    }

    const reader = new FileReader();
    reader.onload = e => {
      this.setState(JSON.parse(e.target.result));
      this.refs.file.value = null;
    };
    reader.readAsText(file);
  }

  toggleTileDefinitions() {
    this.setState({ showTileDefinitions: !this.state.showTileDefinitions });
  }

  render() {
    return (
      <div>
        <style>
          {
            this.state.tileSpec.split('\n').map(function (line, i) {
              const [ w, h, url ] = line.split(' ');
              return `
                .type-${i} {
                  background-image: url("${url}");
                  background-size: contain;
                  width: ${w * 2}px;
                  height: ${h * 2}px;
                }
              `;
            })
          }
        </style>
        <div className="header">
          <h1>Simple Tile Planner</h1>
          {' | '}<a href="help.html">Help</a>
          {' | '}<a href="https://github.com/zdila/simpletileplanner">View on GitHub</a>
          {' | '}<Donate/>
        </div>
        <hr/>
        Project:
        <input type="file" ref="file" onChange={this.load.bind(this)}/><button onClick={this.handleLoadClick.bind(this)}>Load</button>
        <a className="button" download="project.txt" href={`data:text/plain,${JSON.stringify(this.state)}`}>Save</a>
        <button onClick={this.toggleTileDefinitions.bind(this)}>{this.state.showTileDefinitions ? 'Hide' : 'Edit'} tile definitions</button>
        <div className="vr"/> Plan: <select onChange={this.setPlan.bind(this)} disabled={this.state.selected === -1} value={this.state.selected}>
          {this.state.plans.map((plan, i) => <option key={i} value={i}>{plan.name}</option>)}
        </select>
        <button onClick={this.newPlan.bind(this)}>Add new</button>
        <button onClick={this.deletePlan.bind(this)} disabled={this.state.selected === -1}>Delete</button>

        {this.state.showTileDefinitions &&
          <div>
            <hr/>
            <label title="[width in cm] [height in cm] [image URL]">
              Tiles: <textarea cols="100" rows="4" onChange={this.handleTileSpecChange.bind(this)} value={this.state.tileSpec}/>
            </label>
          </div>
        }

        {this.state.selected !== -1 && this.renderPlan()}
      </div>
    );
  }

  renderPlan() {
    const plan = this.state.plans[this.state.selected];
    let { x, y, w, h } = plan;
    x *= 2; y *= 2; w *= 2; h *= 2;

    return (
      <div>
        <hr/>
        {
          [ 'x', 'y', 'w', 'h' ].map((v, i) =>
            <span key={v}>{i ? ', ' : ''}{v} = <input type="number" value={plan[v]} onChange={this.change.bind(this, v)} min="0" max="1000"/> cm</span>
          )
        }
        {' '}| <label><input type="checkbox" checked={this.state.person} onClick={this.togglePerson.bind(this)}/> Show person (180 cm)</label>
        <hr/>
        {[ 0, 1, 2, 3 ].map(type => <button key={type} className={'type ' + (type === this.state.type ? 'selected' : '')}
            onClick={this.select.bind(this, type)}><div className={'type-' + type}/></button>)}
        <hr/>

        <div className="work">
          <table className="table">
            <tbody>
              <tr>
                <td/>
                {this.g1()}
              </tr>
              {this.g2()}
            </tbody>
          </table>
          {this.state.person && <Person x={x} y={y} w={w} h={h}/>}
          <svg className="mask">
            <path fill="white" d={`M 0 0 L 0 1500 L 2000 1500 L 2000 0 z M ${x} ${y} L ${w + x} ${y} L ${w + x} ${h + y} L ${x} ${h + y} z`}/>
          </svg>
        </div>
      </div>
    );
  }

}

ReactDOM.render(
  <Tiler/>,
  document.getElementById('example')
);

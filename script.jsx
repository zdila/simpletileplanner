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
  h: 200,
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
      a.push(<td onClick={this.handleColClick.bind(this, i)} className="col"/>);
    }
    return a;
  }

  g2() {
    const plan = this.state.plans[this.state.selected];
    const a = [];
    for (let y = 0; y < plan.height; y++) {
      a.push(
        <tr>
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
        <td onClick={this.handleClick.bind(this, x, y)}>
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

  togglePerson(e) {
    this.setState({ person: !this.state.person });
  }

  handleTileSpecChange(e) {
    this.setState({ tileSpec: e.target.value });
  }

  load() {
    const file = this.refs.file.files[0];
    if (!file) {
      window.alert('Please select a project file first.');
    }

    const reader = new FileReader();
    reader.onload = e => {
      this.setState(JSON.parse(e.target.result));
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
        <h1>Simple Tile Designer</h1>
        <a href="help.html">Help</a>
        {' '}<a href="https://github.com/zdila/simpletileplanner">View on GitHub</a>
        {' '}<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_top" className="donate">
          <input type="hidden" name="cmd" value="_s-xclick"/>
          <input type="hidden" name="hosted_button_id" value="5E5GNZUBJA2YL"/>
          <input type="image" src="https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif" border="0" name="submit" alt="PayPal - The safer, easier way to pay online!"/>
        </form>
        <hr/>
        Project:
        <button onClick={this.toggleTileDefinitions.bind(this)}>{this.state.showTileDefinitions ? 'Hide' : 'Edit'} tile definitions</button>
        <input type="file" ref="file"/><button onClick={this.load.bind(this)}>Load</button>
        <a download="project.txt" href={`data:text/plain,${JSON.stringify(this.state)}`}>Save</a>
        {this.state.showTileDefinitions &&
          <div>
            Tiles: <textarea cols="100" rows="4" onChange={this.handleTileSpecChange.bind(this)}>{this.state.tileSpec}</textarea>
          </div>
        }
        <hr/>
        Plan: <select onChange={this.setPlan.bind(this)} disabled={this.state.selected === -1}>
          {this.state.plans.map((plan, i) => <option value={i} selected={this.state.selected === i}>{plan.name}</option>)}
        </select>
        <button onClick={this.newPlan.bind(this)}>Add new</button>
        <button onClick={this.deletePlan.bind(this)} disabled={this.state.selected === -1}>Delete</button>

        <br/>
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
            <span>{i ? ', ' : ''}{v} = <input type="number" value={plan[v]} onChange={this.change.bind(this, v)} min="0" max="1000"/> cm</span>
          )
        }
        {' '}| <label><input type="checkbox" checked={this.state.person} onClick={this.togglePerson.bind(this)}/> Show person</label>
        <br/>
        {[ 0, 1, 2, 3 ].map(type => <button className={'type ' + (type === this.state.type ? 'selected' : '')}
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
          {this.state.person &&
            <svg className="person" xmlns="http://www.w3.org/2000/svg" height="360" width="117" version="1.1" viewBox="0 0 117 360"
                style={{ left: `${x + 22 + (w - 117) / 2}px`, top: `${y + h - 360 + 22}px` }}>
              <g transform="translate(0 -692.36)">
                <g fill="#eb9e25" transform="matrix(.82612 0 0 .82718 -130.68 663.83)">
                  <path fill-rule="evenodd" stroke="#000" stroke-width="1.2097pt" fill="#eb9e25" stroke-linejoin="round" d="m226.54 75.312c2.8791 5.7583 1.2413 10.696 0.52145 16.454-7.4748 6.9985-31.078 3.5038-34.891 9.753-7.947 12.037-32.768 47.871-33.012 58.775 0.29166 9.586 20.009 44.252 31.402 56.013 2.7118 0.59919 7.0192 1.0313 8.7411-0.38623 0.89877-4.9346 1.1658-8.9012 2.2091-12.63-1.4451-0.84694-3.1717-0.18718-5.2627-0.0631-5.7904-7.0345-11.969-33.653-13.056-40.274 5.2665-9.5214 8.7857-21.777 17.701-35.798 2.4781 18.588 7.9063 47.883 5.5623 58.893-19.574 42.67 3.0376 130.68 3.6219 146.86-6.4499 30.651 9.2797 90.593 9.6784 96.152-0.42813 5.1455-3.4908 8.9397-1.5456 12.125-2.6022 11.04-4.4961 15.028-2.3368 21.506 2.1594 6.478 17.766 8.094 20.767 4.0964 0.93384-6.0646-0.60757-21.374-2.7669-24.253 1.1479-2.4657 2.5413-11.11 0.19728-18.521-2.7574-9.479 5.8245-63.068-0.7753-78.043 0.84154-3.3996 2.1728-14.491 2.1875-19.438-0.80452-2.9757 0.47953-35.1 2-60.188 1.5264 25.115 2.8068 57.422 2 60.406-2.8791 2.8791 0.5181 18.513 2.5999 21.499-2.0523 6.2934 3.2234 66.502 7.4939 73.501-2.344 7.4119 0.2896 14.816 1.4375 17.281-2.1593 2.8792-4.5276 19.842-3.5938 25.906 3.0009 3.9976 19.434 0.72803 21.594-5.75 2.1594-6.4781-0.98013-8.3972-3.5823-19.438 1.9453-3.1855-0.73422-10.698-1.1624-15.844 0.39871-5.5589 8.7182-58.481 2.2683-89.957-1.065-14.527 25.839-107.34 3.9025-147.96 0.90347-12.099-0.4364-42.534 2.1511-60.034-0.71979 6.478 2.5201 48.078 7.204 60.421-3.1708 15.237 1.748 57.894-1.1311 62.213-1.2297 5.1434-1.4113 13.638-1.9443 20.156 3.5989-2.1594 3.0429-4.5915 5.2317-3.1814 2.6022 5.1308-5.809 10.99-5.8384 15.537 5.7583 0 16.487-7.2189 12.338-31.381-0.0147-9.693 15.981-62.048 8.2958-75.018 2.6503-8.4233-3.7658-60.692-8.819-71.075-3.813-6.2493-28.002-3.814-35.477-10.812-0.71978-5.7583-3.5979-11.523-0.71875-17.281 6.4781-9.3572 6.7095-40.117-11.312-40.281-23.263 0.01308-20.358 30.705-13.88 40.062z"/>
                </g>
              </g>
            </svg>
          }
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

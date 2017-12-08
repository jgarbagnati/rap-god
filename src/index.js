import Inferno from 'inferno';
import Component from 'inferno-component';
import Options from './components/Options';
import Tracery from './lib/tracery';
import Rules from './lib/rules';

export default class Boteezy extends Component {
	constructor(props) {
		super(props);
		
		let grammars = {};
		let options = [];
		let defaultOption = '';
		let rule = '';
		for (rule in Rules) {
			if (rule === 'defaultOption') {
				defaultOption = Rules[rule];
				console.log(defaultOption);
			} else {
				options.push(rule);
				grammars[rule] = Tracery.createGrammar(Rules[rule]);
			}
		}
		
		this.state = {
			blurbs: [],
			postCount: 0,
			options: options,
			grammars: grammars,
			currOption: defaultOption
		};
		
		this.selectGrammar = this.selectGrammar.bind(this);
		this.generateLyrics = this.generateLyrics.bind(this);
		this.displayLyrics = this.displayLyrics.bind(this);
	}
	
	selectGrammar(grammar) {
		this.setState({
			currOption: grammar
		});
	}
	
	generateLyrics(evt) {
		let grammar = this.state.grammars[this.state.currOption];
		let generated = grammar.flatten('#origin#');
		this.state.blurbs.push(generated);
		
		this.setState({
			postCount: this.state.postCount + 1
		});
	}
	
	displayLyrics() {
		let out = [];
		let i = this.state.blurbs.length;
		while (i --> 0) {
			let blurb = (
				<div key={i}
					 className='blurb'>
					{this.state.blurbs[i]}
				</div>
			);
			
			out.push(blurb);
		}
		return out;
	}
	
	render() {
		return (
			<div id='inferno-root'>
				<div className='lyricBlock'>
					<div onclick={this.generateLyrics}>
						<h1> lol </h1>
						{this.displayLyrics()}
					</div>
				</div>
				<Options selectGrammar={this.selectGrammar}
					options={this.state.options} />
			</div>
		);
	}
}

Inferno.render(
	<Boteezy />,
	document.getElementById('root')
);

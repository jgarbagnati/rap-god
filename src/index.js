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
		let generated = this.generate(grammar);
		this.state.blurbs.push(generated);
		
		this.setState({
			postCount: this.state.postCount + 1
		});
	}
	
	generate(grammar) {
		let gen = '';
		do {
			gen = this.postProcess(grammar.flatten('#origin#'))
		} while (gen.length == 0);
		return gen;
	}

	// Post processing
	postProcess(input) {
		return this.processSizeLimit(input);
	}

	processSizeLimit(input) {
		let temp = "";
		let split = input.split('.');
		for (let i = 0; i < split.length; ++i) {
			let str = split[i];
			if (this.checkLength(str + '.')) {
				return str + '.';
			} else if (this.checkLength(temp + str + '.')) {
				return temp + str + '.';
			} else if (this.checkLowerBound(str + '.') || this.checkLowerBound(temp + str + '.')) {
				temp += str + '.';
			} else {
				temp = "";
			}
		}
		return "";
	}

	// Check lower bound
	checkLowerBound(str) {
		return !(str.length < 60);
	}

	// Check upper bound
	checkUpperBound(str) {
		return !(str.length > 140);
	}

	// Check if we're between 100 and 140 characters.
	checkLength(str) {
		return this.checkLowerBound(str) && this.checkUpperBound(str);
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
						<h1> Generate </h1>
					</div>
					{this.displayLyrics()}
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

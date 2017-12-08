import Inferno from 'inferno';
import Component from 'inferno-component';
import Options from './components/Options';
import Tracery from './lib/tracery';
import Lyrics from './lib/lyrics';

export default class Boteezy extends Component {
	constructor(props) {
		super(props);
		
		let lyrics = {};
		let options = [];
		let defaultOption = '';
		let rule = '';
		for (rule in Lyrics) {
			if (rule === 'defaultOption') {
				defaultOption = Lyrics[rule];
			} else {
				options.push(rule);
				lyrics[rule] = Tracery.createGrammar(Lyrics[rule]);
			}
		}
		
		this.state = {
			title: '',
			rap: [],
			postCount: 0,
			options: options,
			titles: [],
			lyrics: lyrics,
			currOption: defaultOption
		};
		
		this.selectGrammar = this.selectGrammar.bind(this);
		this.generateRap = this.generateRap.bind(this);
		this.displayLyrics = this.displayLyrics.bind(this);
	}
	
	selectGrammar(grammar) {
		this.setState({
			currOption: grammar
		});
	}
	
	generateRap(evt) {
		let lyrics = this.state.lyrics[this.state.currOption];
		let rap = [];
		let lines = Math.ceil(Math.random() * 50) + 50;
		for (let i = 0; i < lines; ++i) {
			rap.push(this.generateLine(lyrics));
		}
		
		this.setState({
			rap: rap
		});
	}
	
	generateLine(grammar) {
		let gen = '';
		do {
			gen = this.postProcessLyrics(grammar.flatten('#origin#'));
		} while (gen.length == 0);
		return gen;
	}

	// Post processing
	postProcessLyrics(input) {
		return this.processSizeLimit(input);
	}

	processSizeLimit(input) {
		console.log(input);
		let temp = "";
		let split = input.split('/');
		for (let i = 0; i < split.length; ++i) {
			let str = split[i];
			if (this.checkLength(str)) {
				return str;
			} else if (this.checkLength(temp + str)) {
				return temp + str;
			} else if (this.checkLowerBound(str) || this.checkLowerBound(temp + str)) {
				temp += str;
			} else {
				temp = "";
			}
		}
		return "";
	}

	// Check lower bound
	checkLowerBound(str) {
		return !(str.length < 20);
	}

	// Check upper bound
	checkUpperBound(str) {
		return !(str.length > 80);
	}

	// Check if we're between 100 and 140 characters.
	checkLength(str) {
		return this.checkLowerBound(str) && this.checkUpperBound(str);
	}
	
	displayLyrics() {
		let out = [];
		let i = this.state.rap.length;
		while (i --> 0) {
			let line = (
				<div key={i}
					 className='line'>
					{this.state.rap[i]}
				</div>
			);
			
			out.push(line);
		}
		return out;
	}
	
	render() {
		return (
			<div id='inferno-root'>
				<div className='lyricBlock'>
					<div onclick={this.generateRap}>
						<h1> Generate </h1>
					</div>
					{this.state.title}
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

import Inferno from 'inferno';
import Component from 'inferno-component';
import Options from './components/Options';
import Tracery from './lib/tracery';
import Lyrics from './lib/lyrics';
import Random from 'seedrandom';
let UnSeeded = Math.random;

function generateRandomSeed() {
	let safeVals = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
	let seed = "";
	while(seed.length < 20)
		seed += safeVals.charAt(Math.floor(UnSeeded() * safeVals.length));
	
	window.location.hash = '#' + seed;
	return seed;
}

function getCurrentSeed() {
	let hash = window.location.hash;
	return (hash.length > 0)? hash.substr(1): generateRandomSeed();
}

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
			seed: getCurrentSeed(),
			title: '',
			rap: [],
			postCount: 0,
			options: options,
			titles: [],
			lyrics: lyrics,
			currOption: defaultOption
		};
		
		let rap = this.generateRap(this.state.seed);
		this.state.title = rap.title;
		this.state.rap = rap.rap;
		
		this.selectGrammar = this.selectGrammar.bind(this);
		this.generateNewRap = this.generateNewRap.bind(this);
		this.displayLyrics = this.displayLyrics.bind(this);
	}
	
	seedRNG(seed) {
		Math.random = new Math.seedrandom(seed);
		Tracery.setRng(Math.random);
	}
	
	selectGrammar(grammar) {
		this.setState({
			currOption: grammar
		});
	}
	
	generateNewRap(evt) {
		let seed = generateRandomSeed();
		let rap = this.generateRap(seed);
		this.setState({
			seed: seed,
			title: rap.title,
			rap: rap.rap
		});
	}
	
	generateRap(seed) {
		// Set Random Number Generator
		this.seedRNG(seed);
		
		// Grab artist
		let artists = Object.keys(this.state.lyrics);
		let artist = this.state.currOption;
		
		// Set up rap generation
		let rap = [];
		let rapLen = Math.ceil(Math.random() * 50) + 25;
		let hooks = Math.ceil(Math.random() * 5) + 1;
		let hookOffset = Math.floor(rapLen / hooks);
		let hookCounter = Math.floor(Math.random() * rapLen) % hookOffset;
		
		// Add featuring?
		let isFeaturing = (Math.random() * 4 << 0) == 0;
		let featuring = artist;
		let hasFeatured = false;
		while (isFeaturing && featuring === artist) {
			featuring = artists[artists.length * Math.random() << 0];
		}
		
		// Generate the hook
		let hook = [];
		let hookLen = Math.ceil(Math.random() * 2) + 2;
		let featuredHook = isFeaturing && (Math.random() * 4 << 0) == 0;
		let lyrics = (featuredHook)? this.state.lyrics[featuring]:
			this.state.lyrics[artist];
		for (let i = 0; i < hookLen; ++i)
			hook.push(this.generateLine(lyrics));
		let hookArtist = (featuredHook)? featuring: artist;
		
		if (hookCounter > 0 && isFeaturing) rap.push(<b>{artist}:</b>);
		lyrics = this.state.lyrics[artist];
		for (let i = 0; i < rapLen; ++i) {
			if (--hookCounter <= 0) {
				// Generate from above offset
				if (i != 0) rap.push(<br />);
				if (isFeaturing) rap.push(<b>Hook ({hookArtist}):</b>);
				for (let j = 0; j < hookLen; ++j) {
					rap.push(hook[j]);
				}
				if (i != rapLen - 1) rap.push(<br />);
				hookCounter = hookOffset + Math.ceil(Math.random() * hookOffset/2 - hookOffset/4);
				
				if (isFeaturing && !hasFeatured && (Math.random() * 2 << 0) == 0) {
					rap.push(<b>{featuring}:</b>);
					hasFeatured = true;
					lyrics = this.state.lyrics[featuring];
				} else {
					if (isFeaturing) rap.push(<b>{artist}:</b>);
					lyrics = this.state.lyrics[artist];
				}
			} else {
				rap.push(this.generateLine(lyrics));
			}
		}
		
		// Generate the title
		let title = hook[Math.random() * hookLen << 0];
		title += (hasFeatured)? " (ft. " + featuring + ")":"";
		
		return {title: title, rap: rap.reverse()};
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
		return this.processSizeLimit(input,
			function(str) {return !(str.length > 80);},
			function(str) {return !(str.length < 20);});
	}
	
	processSizeLimit(input, upperbound, lowerbound) {
		let temp = "";
		let split = input.split('/');
		for (let i = 0; i < split.length; ++i) {
			let str = split[i];
			if (this.checkLength(str, upperbound, lowerbound)) {
				return str;
			} else if (this.checkLength(temp + str, upperbound, lowerbound)) {
				return temp + str;
			} else if (lowerbound(str) || lowerbound(temp + str)) {
				temp += str;
			} else {
				temp = "";
			}
		}
		return "";
	}

	// Check if we're between 100 and 140 characters.
	checkLength(str, upperbound, lowerbound) {
		return lowerbound(str) && upperbound(str);
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
					<div onclick={this.generateNewRap}>
						<h1> Generate </h1>
					</div>
					<h3>{this.state.currOption}</h3>
					<h3>{this.state.title}</h3>
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

import Inferno from 'inferno';
import Component from 'inferno-component';
import Options from './components/Options';
import Tracery from './lib/tracery';
import Lyrics from './lib/lyrics';
import Random from 'seedrandom';
import SikBeat from './lib/sik_beat';
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
			showLyrics: true,
			lineNode: null,
			lastLine: "",
			currLine: "",
			nextLine: "",
			currOption: defaultOption,
			highlightLine: -1,
		};
		
		let rap = this.generateRap(this.state.seed);
		this.state.title = rap.title;
		this.state.rap = rap.rap;
		
		this.playRap = this.playRap.bind(this);
		this.toggleLyrics = this.toggleLyrics.bind(this);
		this.generateNewRap = this.generateNewRap.bind(this);
		this.selectGrammar = this.selectGrammar.bind(this);
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
	
	playRap() {
		let rap = this.state.rap;
		let i = rap.length;
		let pitch = 1;
		let lastLine = null;
		while (i --> 0) {
			if (typeof rap[i] === "string") {
				var line = new SpeechSynthesisUtterance(rap[i]);
				line.rate = 1.5;
				line.keyVal = i;
				line.lastLine = lastLine;
				line.onend = function(evt) {
					let currLine = this.state.currLine;
					let nextLine = currLine.nextLine;
					if (nextLine != null) {						
						let lastText = (nextLine.lastLine != null)? nextLine.lastLine.text: "";
						let nextText = (nextLine.nextLine != null)? nextLine.nextLine.text: "";
						this.setState({
							lastLine: nextLine.lastLine,
							currLine: nextLine,
							nextLine: nextLine.nextLine,
							highlightLine: nextLine.keyVal
						});
						window.speechSynthesis.speak(nextLine);
					} else {
						this.setState({
							currLine: "",
							showLyrics: true,
							highlightLine: -1
						})
					}
				}
				line.onend = line.onend.bind(this);
				lastLine = line;
			}
		}
		
		if (lastLine != null) {
			lastLine.nextLine = null;
			let currLine = lastLine;
			while (currLine.lastLine != null) {
				currLine.lastLine.nextLine = currLine;
				currLine = currLine.lastLine;
			}
			this.setState({
				lastLine: currLine.lastLine,
				currLine: currLine,
				nextLine: currLine.nextLine,
				highlightLine: currLine.keyVal,
				showLyrics: false
			});
			window.speechSynthesis.speak(currLine);
			SikBeat();
		}
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
	
	toggleLyrics(evt) {
		this.setState({
			showLyrics: this.state.currLine === ""
				|| !this.state.showLyrics
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
		let lastLine = "";
		let lineEndings = [];
		for (let i = 0; i < hookLen; ++i) {
			lastLine = this.generateLine(lyrics, lastLine, lineEndings);
			hook.push(lastLine);
		}
		let hookArtist = (featuredHook)? featuring: artist;
		
		if (hookCounter > 0 && isFeaturing) rap.push(<b>{artist}:</b>);
		lyrics = this.state.lyrics[artist];
		lastLine = "";
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
				lastLine = "";
				lineEndings = [];
			} else {
				lastLine = this.generateLine(lyrics, lastLine, lineEndings);
				rap.push(lastLine);
			}
		}
		
		// Generate the title
		let title = hook[Math.random() * hookLen << 0];
		title += (hasFeatured)? " (ft. " + featuring + ")":"";
		
		return {title: title, rap: rap.reverse()};
	}
	
	generateLine(grammar, lastLine, lineEndings) {
		let gen = '';
		let best = "";
		let bestFitness = -1;
		for (let i = 0; i < 500; ++i) {
			do {
				gen = this.postProcessLyrics(grammar.flatten('#origin#')).trim();
			} while (gen.length == 0);
			if (lastLine === "") {
				best = gen;
				break;
			}
			let fitness = this.checkFitness(lastLine, gen, lineEndings);
			if (fitness > bestFitness) {
				bestFitness = fitness;
				best = gen;
				if (fitness > 140) break;
			}
		}
		lineEndings.push(best.split(' ')[best.split(' ').length - 1]);
		return best;
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

	// Check if we're between 20 and 80 characters.
	checkLength(str, upperbound, lowerbound) {
		return lowerbound(str) && upperbound(str);
	}
	
	// Check the fitness between two lines for search
	checkFitness(previous, current, lineEndings) {
		if (previous === current) return 0; // Make sure we don't just repeat lines
		let prev = previous.split(' ');
		let curr = current.split(' ');
		let prevTail = prev[prev.length - 1];
		let currTail = curr[curr.length - 1];
		prevTail = prevTail.split("!")[0].split("?")[0];
		currTail = currTail.split("!")[0].split("?")[0];
		if (prevTail == currTail) return 0;
		let isRhyme = this.isRhyming(prevTail, currTail);
		let rhymeFitness = (isRhyme)? 100: 0;
		if (isRhyme) {
			for (let i = 0; i < lineEndings.length; ++i) {
				let temp = lineEndings[i].split("!")[0].split("?")[0];
				if (currTail === temp) {
					rhymeFitness = 10;
					break;
				}
			}
		}
				
		let sizeFitness = 60 - Math.abs(previous.length - current.length);
		return rhymeFitness + sizeFitness;
	}
	
	// Really simple rhyme detection
	isRhyming(a,b) {
		
		if (a.length < 3 || b.length < 3) {
			let min = Math.min(a.length, b.length);
			return a.substr(a.length - min) === b.substr(b.length - min);
		};
		let asub = a.split('...')[0].substr(a.length - 3);
		let bsub = b.split('...')[0].substr(b.length - 3);
		if (asub === "in'") asub = "ing";
		if (bsub === "in'") bsub = "ing";
		return asub === bsub;
	}
	
	displayLyrics() {
		let out = [];
		let i = this.state.rap.length;
		while (i --> 0) {
			let classNames = 'line' + ((this.state.highlightLine == i)? ' highlighted': '');
			let line = (
				<div key={i}
					className={classNames}>
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
					<div className='lyrics'>
						<h1>{(this.state.lastLine != null)? this.state.lastLine.text: ""}</h1>
						<h2>{(this.state.currLine != null)? this.state.currLine.text: ""}</h2>
						<h3>{(this.state.nextLine != null)? this.state.nextLine.text: ""}</h3>
					</div>
					<div className={'full-lyrics' + ((this.state.showLyrics)? '': ' hidden')}>
						<h3>{this.state.currOption}</h3>
						<h3>{this.state.title}</h3>
						{this.displayLyrics()}
					</div>
					<div className='btn-cntr'>
						<div className='generate-btn' onclick={this.generateNewRap}>
							<h1> Generate </h1>
						</div>
						<div className='play-btn' onclick={this.playRap}>
							<h1> Spit Fire </h1>
						</div>
						<div className='toggle-btn' onclick={this.toggleLyrics}>
							<h1> Toggle Lyrics </h1>
						</div>
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

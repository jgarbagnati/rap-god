import Tone from 'tone';

let sickBeat = function() {
	var context = new AudioContext;
	var tremolo = new Tone.Tremolo().start()

	var kickTable = [
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0],
		[1, 0, 0, 0, 0, 0, 0]
	];


	var createRandTable = function(){
		var table = new Array(16);
		for (var i = 0; i<16 ; i++){
			table[i] = new Array(7);
			for( var j = 0; j<7; j++){
				table[i][j] = 0;
			}
			table[i][Math.floor(Math.random() * table[i].length)] = 1;
		}
		return table;
	}

	var createDingTable = function(){
		var table = new Array(16);
		for (var i = 0; i<16 ; i++){
			table[i] = new Array(7);
			for( var j = 0; j<7; j++){
				table[i][j] = 0;
			}
		}
		var a, b;
		a = Math.floor(Math.random() * 16)
		b = Math.floor(Math.random() * 7)
		table[a][b] = 1;
		table[(a+1)%16][(b-1)%16] = 1;

		return table;
	}

	function Kick(context) {
		this.context = context;
	};

	Kick.prototype.setup = function() {
		this.osc = this.context.createOscillator();
		this.gain = this.context.createGain();
		this.gain.value = -25;
		this.osc.connect(this.gain);
		this.gain.connect(this.context.destination);
	};

	Kick.prototype.trigger = function(time) {
		this.setup();

		this.osc.frequency.setValueAtTime(65, time);
		this.gain.gain.setValueAtTime(0.025, time);

		this.osc.frequency.exponentialRampToValueAtTime(0.001, time + 0.05);
		this.gain.gain.exponentialRampToValueAtTime(0.00000001, time + 0.05);
		var kickFilter = this.context.createBiquadFilter();
		kickFilter.type = 'lowpass';
		kickFilter.frequency.value = 1000;
		this.osc.connect(kickFilter);

		this.osc.start(time);

		this.osc.stop(time + 0.5);
	};



	////////////////////////////////////////////////////////////////////
	///////////////////////////INSTRUMENTS ////////////////////////////
	///////////////////////////////////////////////////////////////////
	var noteNames = ["A2", "B2", "C2", "D2", "E2", "F2", "G2"];
	var kick = new Tone.Player("./res/kick.wav", {"volume" : 0.1, "fadeOut" : "1n"}).toMaster();
	var dings = new Tone.Players({
			"A2" : "./res/DingA.wav",
			"B2" : "./res/DingB.wav",
			"C2" : "./res/DingC.wav",
			"D2" : "./res/DingD.wav",
			"E2" : "./res/DingE.wav",
			"F2" : "./res/DingF.wav",
			"G2" : "./res/DingG.wav",

		}, {
			"volume" : -100,
			"fadeOut" : "1n",
		}).toMaster();

	var kickLoop = new Tone.Sequence(function(time, col){
		for( var i = 0; i<16; i++){
			if (kickTable[i][0] == 1){
				var vel = Math.random() * 0.5 +0.1;
				kick.start(time, 0, "1n", 0, vel);
			}
		}
	},[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "2n");





	var myBeat = createRandTable();
	var keys = new Tone.PolySynth(4).chain(tremolo).toMaster();
	keys.set("Distortion",0.1).toMaster();
	keys.set("Detune", -300).toMaster();
	keys.volume.value = -5;

	var loop = new Tone.Sequence(function(time, col){
		for( var i = 0; i < 8; i++){
			for (var j = 0; j < 16; j++){
				if (myBeat[col][j] == 1){
					keys.triggerAttackRelease(noteNames[j], "1n", time);

				}
			}
		}
	},[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], "2n");

	Tone.Transport.bpm.value = 120;
	Tone.Transport.start();
	kickLoop.start();
	loop.start();
};

module.exports = sickBeat;

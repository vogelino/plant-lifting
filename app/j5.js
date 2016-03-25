var five = require('johnny-five');
var Particle = require('particle-io');

module.exports = function() {
	var my = {};
	var that = {};

	my.board = new five.Board({
		io: new Particle({
			token: process.env.PARTICLE_TOKEN,
			deviceId: process.env.PARTICLE_DEVICE_ID,
			deviceName: 'Vogeliton'
		})
	});
	my.boardReady = null;

	my.isPlaying = null;
	my.animation = null;
	my.servo = null;
	my.light = null;
	my.servoDuration = 8000;
	my.servoPosition = {
		up: 15,
		down: 150
	};
	my.minLightValue = 18;

	my.isInitialized = function() {
		return !!my.servo && !!my.light && !!my.boardReady && !!my.animation;
	};

	my.playAnimation = function() {
		if (my.isPlaying === true) {
			return;
		}

		console.log('Animation played');
		my.animation.play();
		my.isPlaying = true;
	};

	my.pauseAnimation = function() {
		if (my.isPlaying === false) {
			return;
		}

		console.log('Animation paused');

		my.isPlaying = false;
		my.animation.pause();
	};

	that.init = function() {
		console.log('Initializing the j5 component');

		my.board.on('ready', function() {
			console.log('Board is ready');

			my.boardReady = true;
			my.servo = five.Servo('D0');
			my.light = five.Sensor({
				pin: 'A0',
				type: 'analog',
				freq: 250
			});
			my.animation = five.Animation(my.servo);

			console.log('Animation initialized for the first time');

			my.animation.enqueue({
				cuePoints: [0, 0.5, 1],
				keyFrames: [
					{ value: my.servoPosition.down, easing: 'inOutQuad' },
					{ value: my.servoPosition.up, easing: 'inOutQuad' },
					{ value: my.servoPosition.down, easing: 'inOutQuad' }
				],
				duration: my.servoDuration * 2,
				loop: true,
			}).pause();

			my.light.on('data', function() {
				console.log('Photoresistor recieves data:', this.value);
				if (this.value > my.minLightValue) {
					my.playAnimation();
				}
				else {
					my.pauseAnimation();
				};
			});
		});
	};

	return that;
};

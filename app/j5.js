var five = require('johnny-five');

module.exports = function() {
	var my = {};
	var that = {};

	my.board = new five.Board();
	my.boardReady = null;

	my.isPlaying = null;
	my.animation = null;
	my.servo = null;
	my.light = null;
	my.servoDuration = 4000;
	my.servoPosition = {
		up: 15,
		down: 150
	};
	my.minLightValue = 50;

	my.isInitialized = function() {
		return !!my.servo && !!my.light && !!my.boardReady && !!my.animation;
	};

	my.playAnimation = function() {
		if (my.isPlaying === true) {
			return;
		}
		else if (my.isPlaying === null) {
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
		}

		my.animation.play();
		my.isPlaying = true;
	};

	my.pauseAnimation = function() {
		if (my.isPlaying === false) {
			return;
		}
		my.isPlaying = false;
		my.animation.pause();
	};

	that.init = function() {
		my.board.on('ready', function() {
			my.boardReady = true;
			my.servo = five.Servo(10);
			my.light = five.Sensor({
				pin: 'A0',
				type: 'analog',
				freq: 250
			});
			my.animation = five.Animation(my.servo);
			my.light.on('data', function() {
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

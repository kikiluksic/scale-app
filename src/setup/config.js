const scales = require('./scales.js');

const scale = {
	name: 'NVT3200M',
	port: 'COM3',
	units: ['g', 'kg', 'ct'],
	tare_label: 'NET',
	terminator: '\r\n', // terminate/send the command
	_get: {
		config() {
			// scale commands and settings
			return scales.find((_scale) => {
				return _scale.name === scale.name;
			});
		},
		commands() {
			// all enabled commands
			return this.config().commands.filter((command) => {
				return command.enabled;
			});
		},
		settings() {
			// all enabled settings
			return this.config().settings.filter((setting) => {
				return setting.enabled;
			});
		},
	},
};

module.exports = scale;

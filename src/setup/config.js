const scales = [
	{
		name: 'NVT3200M',
		commands: [
			{
				label: 'Print',
				action: 'print',
				command: 'P',
				enabled: 1,
			},
			{
				label: 'Zero',
				action: 'zero',
				command: 'Z',
				enabled: 1,
			},
			{
				label: 'Tare',
				action: 'tare',
				command: 'T',
				enabled: 1,
			},
		],
		settings: [
			{
				label: 'Stable weight only',
				action: 'stable-weight-only',
				command: 'SP',
				enabled: 1,
			},
			{
				label: 'Immediate weight print',
				action: 'immediate-print-of-weights', //stable or unstable
				command: 'IP',
				enabled: 1,
			},
			{
				label: 'Countinuous weights print',
				action: 'continuous-print-of-weights',
				command: 'CP',
				enabled: 1,
			},
			{
				label: 'Auto Print (non-zero only)',
				action: 'auto-print-stable-nonzero-only',
				command: 'SLP',
				enabled: 1,
			},
			{
				label: 'Auto print stable (non-zero/zero)',
				action: 'auto-print-stable-nonzero-and-zero',
				command: 'SLZP',
				enabled: 1,
			},
			{
				label: 'Auto print - OFF',
				action: 'auto-print-off',
				command: '0P',
				enabled: 1,
			},
			{
				label: 'Print current mode',
				action: 'print-current-mode', // returns which mode is used
				command: 'PM',
				enabled: 0,
			},
			{
				label: 'Print current unit',
				action: 'print-current-unit', // returns which measure unit is used
				command: 'PU',
				enabled: 1,
			},
			{
				label: 'Change mode',
				action: 'advance-to-next-mode', // advances to next set mode
				command: 'M',
				enabled: 0,
			},
			{
				label: 'Change unit',
				action: 'advance-to-enabled-unit', // Change the measure unit
				command: 'U',
				enabled: 1,
			},
			{
				label: 'Software version',
				action: 'software-version',
				command: 'PV',
				enabled: 0,
			},
		],
	},
	{
		name: 'TESTSCALE',
		commands: [
			{
				action: 'print',
				command: 'P',
			},
			{
				action: 'zero',
				command: 'Z',
			},
			{
				action: 'tare',
				command: 'T',
			},
		],
	},
];

const scale = {
	name: 'NVT3200M',
	port: 'COM3',
	units: ['g', 'kg', 'ct'],
	_get: {
		config: function () {
			// scale commands and settings
			return scales.find(function (_scale) {
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

const _getScaleConfig = (scaleName) => {
	return scales.find((scale) => {
		return scale.name === scaleName;
	});
};

const _getCommandForAction = (action) => {
	const scale_config = _getScaleConfig(scale.name);
	const command = scale_config.commands.find((el) => {
		return el.action === action;
	});
	return Buffer.from(command + '\r\n', 'utf8');
};

module.exports = { scale, _getCommandForAction };

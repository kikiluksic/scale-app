const getScale = (manufacturer) => scales[manufacturer];

export default getScale;

const scales = {
	FTDI: {
		name: 'NVT3200M',
		manufacturer: 'FTDI',
		tare_label: 'NET',
		delimiter: '\r\n',
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
				label: 'Countinuous weights print', // does not work
				action: 'continuous-print-of-weights',
				command: 'CP',
				enabled: 0,
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
	Prolific: {
		name: 'Elzab',
		manufacturer: 'Prolific',
		single_unit: 'kg' // scale can only display in kilograms
	},
};

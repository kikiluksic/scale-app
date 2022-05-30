import getScale from './setup/scales.js';

const SerialPort = require('serialport');

const app = {
	log: [],
	delimiter: null,
	singleUnit: '',
	init: async () => {
		await app.getPorts();

		return;
	},
	getPorts: async () => {
		const ports = await SerialPort.list();

		/* const serialPortData = app.getSerialPortData(ports);
		document.getElementById('specification').innerHTML =
			'<pre>' + JSON.stringify(serialPortData) + '</pre>'; */

		// Check if only one port, connect to it automatically
		if (ports.length > 1) {
			// TODO Write logic if there are more COM ports available
			const container = document.getElementById('port-list');
			// Select PORT and then get scales information

			/* ports.forEach(({ path, manufacturer }) => {
			const scaleData = getScale(manufacturer);
			console.log('ScaleData', scaleData);

			const button = document.createElement('button');
			button.textContent = path;
			button.dataset.manufacturer = manufacturer;
			button.onclick = ({
				target: {
					textContent: serialPort,
					dataset: { manufacturer },
				},
			}) => app.connect;
			container.appendChild(button);
		}); */

			return;
		}

		const { path, manufacturer } = ports[0];
		const { name, tare_label, delimiter, commands, settings, single_unit } =
			getScale(manufacturer);

		document.getElementById('scale-name').textContent = name;

		if (commands) {
			await app.renderCommandBtns(commands);
		}

		if (settings) {
			await app.renderSettingsBtns(settings);
		}

		if (single_unit) {
			app.singleUnit = single_unit;
		}

		app.delimiter = delimiter;
		await app.connect(path);
	},
	connect: async (path) => {
		const Readline = require('@serialport/parser-readline'),
			port = new SerialPort(path, {
				autoOpen: false,
			}),
			parser = port.pipe(new Readline());

		app.portListeners(port, parser);
		app.scaleCommandListeners(port);
	},
	printOutput(data) {
		const stringData = data.toString();
		const output = stringData.trim() + ' ' + app.singleUnit;
		console.log(output);
	},
	portListeners: async (port, parser) => {
		// Open the port
		await port.open((err) => {
			if (err) {
				return console.error('Error opening port: ' + err.message);
			}
		});

		port.on('open', () => {
			document.getElementById('notifications').innerText = 'scale is connected';

			//parser.on('data', app.getData);
			//parser.on('port', (data) => console.log(data.toString()));
			parser.on('data', app.printOutput);
		});

		port.on('close', () => {
			// Pipe the data into another stream (like a parser or standard out)
			document.getElementById('notifications').innerText =
				'scale is not connected';
			console.info('Port has been closed');
		});

		port.on('end', () => {
			console.log('Connection to port has closed');
		});
	},
	scaleCommandListeners: (port) => {
		const commandBtns = document.getElementsByClassName('square-btn');

		for (let i = 0; i < commandBtns.length; i++) {
			commandBtns[i].onclick = () => {
				const command = commandBtns[i].getAttribute('data-cmd');
				port.write(command + app.delimiter);
			};
		}
	},
	renderCommandBtns: async (commands) => {
		await commands.forEach((command) => {
			app.createButton('toolbar', command);
		});

		document.getElementById('toolbar').style.display = 'flex';
	},
	renderSettingsBtns: async (settings) => {
		await settings.forEach((setting) => {
			app.createButton('settings', setting);
		});

		document.getElementById('settings').style.display = 'flex';
	},
	createButton: (container_id, { label, action, command }) => {
		const toolbar = document.getElementById(container_id);
		const button = document.createElement('button');
		button.textContent = label;
		button.setAttribute('value', action);
		button.setAttribute('data-cmd', command);

		if (container_id === 'settings') {
			button.setAttribute('class', 'square-btn settings-btn');
		} else {
			button.setAttribute('class', 'square-btn');
		}

		toolbar.appendChild(button);
	},
	/* writeToPort: (port, command) => {
		port.write(command + app.delimiter);
	}, */
	getData: (data) => {
		if (data.match(/\d+/g) === null) {
			console.log(data);
			return;
		}

		const msg = {
			weight: Number(data.substr(0, 10)),
			unit: data.replace(tare_label, '').match(/[a-zA-Z]+/g, '')[0],
			tare: data.includes(tare_label),
		};

		console.log(msg);
	},
	getSerialPortData: (ports) => {
		const dataArr = [];
		ports.forEach((option) => {
			dataArr.push({
				manufacturer: option.manufacturer,
				serialNumber: option.serialNumber,
				productId: option.productId,
			});
		});
		return dataArr;
	},
};

app.init();

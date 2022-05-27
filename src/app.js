import getScale from './setup/scales.js';

const SerialPort = require('serialport');

const app = {
	log: [],
	delimiter: null,
	init: async () => {
		await app.getPorts();

		return;

		//app.renderCommandBtns();
		app.renderSettingsBtns();
	},
	getPorts: async () => {
		const ports = await SerialPort.list();
		const container = document.getElementById('port-list');

		/* const serialPortData = app.getSerialPortData(ports);
		document.getElementById('specification').innerHTML =
			'<pre>' + JSON.stringify(serialPortData) + '</pre>'; */

		// Check if only one port, connect to it automatically
		if (ports.length === 1) {
			const { path, manufacturer } = ports[0];
			const { tare_label, delimiter, commands, settings } =
				getScale(manufacturer);

				app.delimiter = delimiter;
				await app.renderCommandBtns(commands);
				await app.renderSettingsBtns(settings);
				await app.connect(path);

			return;
		}

		// TODO Write logic if there are more COM ports available
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
	},
	connect: async (path) => {
		const Readline = require('@serialport/parser-readline'),
			port = new SerialPort(path, {
				autoOpen: false,
			}),
			parser = port.pipe(new Readline());

		app.eventListeners(port, parser);
		app.scaleCommandListeners(port);
	},
	eventListeners: async (port, parser) => {
		// Open the port
		await port.open((err) => {
			if (err) {
				return console.error('Error opening port: ' + err.message);
			}
		});

		port.on('open', () => {
			document.getElementById('notifications').innerText = 'port is open';

			//parser.on('data', app.getData);
			parser.on('data', (data) => console.log(data.toString()));
			parser.on('port', (data) => console.log(data.toString()));
		});

		port.on('close', () => {
			// Pipe the data into another stream (like a parser or standard out)
			document.getElementById('notifications').innerText = 'port is closed';
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
				app.writeToPort(port, commandBtns[i].getAttribute('data-cmd'));
			};
		}
	},
	renderCommandBtns: async (commands) => {
		await commands.forEach((command) => {
			app.createButton('toolbar', command);
		});
	},
	renderSettingsBtns: async (settings) => {
		await settings.forEach((setting) => {
			app.createButton('settings', setting);
		});
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
	writeToPort: (port, command) => {
		port.write(command + app.delimiter);
	},
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

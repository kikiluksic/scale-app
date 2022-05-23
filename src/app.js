const {
	name,
	serial_port,
	tare_label,
	delimiter,
	_get,
} = require('setup/config.js');

const SerialPort = require('serialport');

const app = {
	log: [],
	init: async () => {
		await app.getPorts();

		/* if (data[0] != undefined) {
			const serialPortData = app._getSerialPortData(data);
			document.getElementById('specification').innerHTML =
				'<pre>' + JSON.stringify(serialPortData) + '</pre>';
		} */

		// render scale name
		document.getElementById('scale-name').textContent = name;

		// Add list of ports to select from

		app.renderCommandBtns();
		app.renderSettingsBtns();
	},
	getPorts: async () => {
		const ports = await SerialPort.list();
		const container = document.getElementById('port-list');

		const serialPortData = app._getSerialPortData(ports);
		document.getElementById('specification').innerHTML =
			'<pre>' + JSON.stringify(serialPortData) + '</pre>';

		ports.forEach((port) => {
			const button = document.createElement('button');
			button.textContent = port.path;
			button.onclick = app.connect;
			container.appendChild(button);
		});

		console.log('PORTS', ports);
	},
	connect({ target: { textContent: serialPort } }) {
		const Readline = require('@serialport/parser-readline'),
			port = new SerialPort(serialPort, {
				autoOpen: false,
			}),
			parser = port.pipe(new Readline());

		app.eventListeners(port, parser);
		app.scaleCommandListeners(port);
	},
	eventListeners: async (port, parser) => {
		console.log('PORT', port);
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
	renderCommandBtns: () => {
		const commands = _get.commands();
		commands.forEach((command) => {
			app.createButton('toolbar', command);
		});
	},
	renderSettingsBtns: () => {
		const settings = _get.settings();

		settings.forEach((setting) => {
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
		port.write(command + delimiter);
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
	_getSerialPortData: (ports) => {
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

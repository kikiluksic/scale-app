const config = require('setup/config.js');

const app = {
	log: [],
	init: () => {
		const SerialPort = require('serialport'),
			Readline = require('@serialport/parser-readline'),
			port = new SerialPort(config.scale.port, {
				autoOpen: false,
			}),
			parser = port.pipe(new Readline());

		// Open the port
		port.open(function (err) {
			if (err) {
				const error = 'Error opening port: ' + err.message;

				return console.error(error);
			}
		});

		SerialPort.list().then((data) => {
			if (data[0] != undefined) {
				const serialPortData = app._getSerialPortData(data);
				document.getElementById('specification').innerHTML =
					'<pre>' + JSON.stringify(serialPortData) + '</pre>';
			}
		});

		app._renderCommands();
		app._renderSettings();
		app.scaleCommandListeners(port);
		app.eventListeners(port, parser);
	},
	_renderCommands: () => {
		const commands = config.scale._get.commands();

		commands.forEach((command) => {
			app._createButton('toolbar', command);
		});
	},
	_renderSettings: () => {
		const settings = config.scale._get.settings();

		settings.forEach((setting) => {
			app._createButton('settings', setting);
		});
	},
	_createButton: (container_id, data) => {
		const toolbar = document.getElementById(container_id);
		const button = document.createElement('button');
		button.textContent = data.label;
		button.setAttribute('class', 'square-btn');
		button.setAttribute('value', data.action);
		button.setAttribute('data-cmd', data.command);
		toolbar.appendChild(button);
	},
	eventListeners: (port, parser) => {
		// Event listeners
		port.on('open', () => {
			document.getElementById('notifications').innerText = 'port is open';

			// Parser output - outputs in single line
			parser.on('data', app._getData);
		});

		port.on('close', () => {
			// Pipe the data into another stream (like a parser or standard out)
			console.log('Port has been closed');
		});
	},
	scaleCommandListeners: (port) => {
		const commandBtns = document.getElementsByClassName('square-btn');
		console.log(commandBtns);

		for (let i = 0; i < commandBtns.length; i++) {
			commandBtns[i].onclick = () => {
				app._writeToPort(port, commandBtns[i].getAttribute('data-cmd'));
			};
		}
	},
	_writeToPort: (port, command) => {
		const res = port.write(command + config.scale.terminator);
	},
	_getData: (data) => {
		if (data.match(/\d+/g) === null) {
			console.log(data);
			return;
		}

		const string = data.replace(config.scale.tare_label, '');

		const msg = {
			weight: Number(string.replace(/[^0-9\.]+/g, '')),
			unit: string.match(/[a-zA-Z]+/g, '')[0],
			tare: data.includes(config.scale.tare_label),
		};

		console.log(msg);
	},
	_getSerialPortData: (data) => {
		const dataArr = [];
		data.forEach((option) => {
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

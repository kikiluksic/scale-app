const {
	name,
	port: scalePort,
	tare_label,
	delimiter,
	_get,
} = require('setup/config.js');

const app = {
	log: [],
	init: async () => {
		const SerialPort = require('serialport'),
			Readline = require('@serialport/parser-readline'),
			port = new SerialPort(scalePort, {
				autoOpen: false,
			}),
			parser = port.pipe(new Readline());

		const data = await SerialPort.list();
		if (data[0] != undefined) {
			const serialPortData = app._getSerialPortData(data);
			document.getElementById('specification').innerHTML =
				'<pre>' + JSON.stringify(serialPortData) + '</pre>';
		}

		// render scale name
		document.getElementById('scale-name').textContent = name;

		app._renderCommandBtns(port, parser);
		app._renderSettingsBtns();
		app.scaleCommandListeners(port);
		app.eventListeners(port, parser);
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

			parser.on('data', app._getData);
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
				app._writeToPort(port, commandBtns[i].getAttribute('data-cmd'));
			};
		}
	},
	_renderCommandBtns: (port) => {
		const commands = _get.commands();
		commands.forEach((command) => {
			app._createButton('toolbar', command);
		});
	},
	_renderSettingsBtns: () => {
		const settings = _get.settings();

		settings.forEach((setting) => {
			app._createButton('settings', setting);
		});
	},
	_createButton: (container_id, { label, action, command }) => {
		const toolbar = document.getElementById(container_id);
		const button = document.createElement('button');
		button.textContent = label;
		if (container_id === 'settings') {
			button.setAttribute('class', 'square-btn settings-btn');
		} else {
			button.setAttribute('class', 'square-btn');
		}
		button.setAttribute('value', action);
		button.setAttribute('data-cmd', command);
		toolbar.appendChild(button);
	},
	_writeToPort: (port, command) => {
		port.write(command + delimiter);
	},
	_getData: (data) => {
		if (data.match(/\d+/g) === null) {
			console.log(data);
			return;
		}

		const string = data.replace(tare_label, '');

		const isTare = data.includes(tare_label);

		const msg = {
			weight: Number(data.substr(0, 10)),
			unit: string.match(/[a-zA-Z]+/g, '')[0],
			tare: isTare,
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

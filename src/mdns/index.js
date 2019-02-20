import dnssd from 'dnssd';
import InternalIP from 'internal-ip';
import { log } from '../utils';
import uuidv1 from 'uuid/v1';

class Mdns {
	constructor() {
		this.id = uuidv1();
	}

	init(callback) {
		this.httpAd = new dnssd.Advertisement(dnssd.tcp('http'), 8080, {
			name: `keeco-hub-web-${this.id}`,
			subtypes: ['_keeco-hub'],
			txt: {
				path: '/index.html'
			}
		});

		this.mqttAd = new dnssd.Advertisement(dnssd.tcp('mqtt'), 1883, {
			name: `keeco-hub-mqtt-${this.id}`,
			subtypes: ['_keeco-hub'],
			txt: {
				topic: '/register'
			}
		});

		this.httpAd.on('error', err => {
			log(
				'MDNS',
				`HTTP instance publishing ran into an error: ${err}`,
				'error'
			);
		});

		this.mqttAd.on('error', err => {
			log(
				'MDNS',
				`MQTT instance publishing ran into an error: ${err}`,
				'error'
			);
		});

		this.httpAd.start();
		this.mqttAd.start();

		callback();
	}
}

const mdns = new Mdns();

export default mdns;

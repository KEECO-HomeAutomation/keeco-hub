import dnssd from 'dnssd';
import { log } from '../utils';
import uuidv1 from 'uuid/v1';
import ports from '../utils/ports.config';

/**
 * @author uno20001
 * @module mdns/index
 * @summary Mdns responder
 */

class Mdns {
	/**
	 * @author uno20001
	 * @summary Mdns responder class
	 */
	constructor() {
		this.id = uuidv1();
	}

	/**
	 * @author uno20001
	 * @summary Mdns class initalizer method.
	 * @param {function} callback - A callback function.
	 */
	init(callback) {
		this.httpAd = new dnssd.Advertisement(
			dnssd.tcp('http'),
			ports.httpServerPort,
			{
				name: `keeco-hub-web-${this.id}`,
				subtypes: ['_keeco-hub'],
				txt: {
					path: '/index.html'
				}
			}
		);

		this.mqttAd = new dnssd.Advertisement(
			dnssd.tcp('mqtt'),
			ports.mqttServerPort,
			{
				name: `keeco-hub-mqtt-${this.id}`,
				subtypes: ['_keeco-hub'],
				txt: {
					topic: '/register'
				}
			}
		);

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

import Aedes from 'aedes';

import authenticate from './authenticate';
import * as authorize from './authorize';

class CustomAedes extends Aedes {
	constructor() {
		super();

		this.authenticate = authenticate;
		this.authorizePublish = authorize.publish;
		this.authorizeSubscribe = authorize.subscribe;
	}

	publish(packet) {
		return new Promise(resolve => {
			super.publish(packet, resolve);
		});
	}

	subscribe(topic, func) {
		return new Promise(resolve => {
			super.subscribe(topic, func, resolve);
		});
	}
}

export default CustomAedes;

import MulticastDNS from 'multicast-dns';
import InternalIP from 'internal-ip';
import { log } from '../utils';

class Mdns {
	constructor() {
		this.response = [
			{
				name: 'hub.keeco.local',
				type: 'A',
				ttl: 300,
				data: InternalIP.v4.sync()
			}
		];
	}

	init(callback) {
		this.mdns = new MulticastDNS();

		this.mdns.on('query', query => {
			log(
				'MDNS',
				'Received query with question: ' +
					query.questions[0].name +
					' Type: ' +
					query.questions[0].type
			);
			this.mdns.respond(this.response);
		});

		this.mdns.respond(this.response, callback);
	}
}

const mdns = new Mdns();

export default mdns;

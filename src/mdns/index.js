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
			},
			//the responses below are not working
			{
				name: '_mqtt._tcp.hub.keeco.local',
				type: 'SRV',
				data: {
					port: 1883,
					target: 'hub.keeco.local'
				}
			},
			{
				name: '_graphql._tcp.hub.keeco.local',
				type: 'SRV',
				data: {
					port: 5000,
					target: 'hub.keeco.local'
				}
			}
		];
	}

	init(callback) {
		this.mdns = new MulticastDNS();

		this.mdns.on('query', (query, ri) => {
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

import gqlServer from './apollo';

import { log } from './utils';

log('HUB', 'Keeco-hub is starting up', 'message');

gqlServer.listen(5000).then(({ url }) => {
	log('Apollo', 'Apollo server started at: ' + url, 'message');
});

import Aedes from 'aedes';
import net from 'net';

const aedes = new Aedes();
const server = net.createServer(aedes.handle);

export const publish = aedes.publish;
export const subscribe = aedes.subscribe;
export const unsubscribe = aedes.unsubscribe;
export default server;

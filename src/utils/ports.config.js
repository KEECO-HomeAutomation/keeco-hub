/**
 * @author Bence László <bencelaszlo@protonmail.com>
 * @module utils/ports
 * @summary Store configured ports.
 */

const gqlServerPort = 5000; /** @constant {number} gqlServer - GraphQL server port */
const mqttServerPort = 1883; /** @constant {number} mqttServer - MQTT server port */

module.exports = { gqlServerPort, mqttServerPort };

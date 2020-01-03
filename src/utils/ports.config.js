/**
 * @author Bence László <bencelaszlo@protonmail.com>
 * @module utils/ports
 * @summary Store configured ports.
 */

const gqlServerPort = 5000; /** @constant {number} gqlServerPort - GraphQL server port */
const mqttServerPort = 1883; /** @constant {number} mqttServerPort - MQTT server port */
const httpServerPort = 8080; /** @constant {number} httpServerPort - HTTP server port */

module.exports = { gqlServerPort, mqttServerPort, httpServerPort };

import mqtt from 'mqtt';
import { CONFIG } from './config.js';
import { LOGGER } from './logger.js';
export class MQTT {
    connection;
    optimistic;
    constructor(waterHeaters) {
        const { mqtt_host, mqtt_port, mqtt_username, mqtt_password, mqtt_optimistic } = CONFIG();
        this.connection = mqtt.connect(`mqtt://${mqtt_host}:${mqtt_port}`, {
            username: mqtt_username,
            password: mqtt_password,
            reconnectPeriod: 60000,
        });
        this.connection.on('message', (topic, message) => this.onMessage(waterHeaters, topic, message));
        this.connection.on('error', this.onError);
        this.optimistic = mqtt_optimistic;
    }
    onError(error) {
        LOGGER.error({ message: 'MQTT Error Occured', error });
    }
    onMessage(waterHeaters, topic, message) {
        LOGGER.trace({ message: 'Got MQTT Message', topic, msg: message.toString() });
        const [, deviceId, commands, commandType] = topic.split('/');
        // Make sure we are on the commands topic
        if (commands !== 'commands') {
            return;
        }
        if (deviceId in waterHeaters) {
            waterHeaters[deviceId].updatePendingCommands(commandType, message.toString());
        }
    }
    async publish(topic, payload) {
        await this.connection.publishAsync(topic, payload, { retain: true });
    }
    async subscribe(topic) {
        await this.connection.subscribeAsync(topic);
    }
}
//# sourceMappingURL=mqtt.js.map
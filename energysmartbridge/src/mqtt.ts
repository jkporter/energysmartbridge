import mqtt from 'mqtt';
import { CONFIG } from './config.js';
import { LOGGER } from './logger.js';
import type { WaterHeater } from './waterheater.js';

export class MQTT {
    connection: mqtt.MqttClient;
    optimistic: boolean;

    constructor(waterHeaters: Record<string, WaterHeater>) {
        const { mqtt_host, mqtt_port, mqtt_username, mqtt_password, mqtt_optimistic } = CONFIG();

        this.connection = mqtt.connect(`mqtt://${mqtt_host}:${mqtt_port}`, {
            username: mqtt_username,
            password: mqtt_password,
            reconnectPeriod: 60000,
        });

        this.connection.on('message', (topic, message) =>
            this.onMessage(waterHeaters, topic, message),
        );
        this.connection.on('error', this.onError);

        this.optimistic = mqtt_optimistic;
    }

    onError(error: Error): void {
        LOGGER.error({ message: 'MQTT Error Occured', error });
    }

    onMessage(
        waterHeaters: Record<string, WaterHeater>,
        topic: string,
        message: Buffer,
    ): void {
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

    async publish(topic: string, payload: string): Promise<void> {
        await this.connection.publishAsync(topic, payload, { retain: true });
    }

    async subscribe(topic: string): Promise<void> {
        await this.connection.subscribeAsync(topic);
    }
}

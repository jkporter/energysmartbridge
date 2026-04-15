import { CONFIG } from './config.js';
import { LOGGER } from './logger.js';
import { DEVICE_CLASS_MAPPING, READABLE_MAPPING } from './mappings.js';
import type { MQTT } from './mqtt.js';

/** Minimal interface of WaterHeater that BaseEntity needs, to avoid circular imports. */
export interface IWaterHeater {
    deviceId: string;
    generateDeviceConfig(): Record<string, unknown>;
}

export type EntityConfig = Record<string, unknown>;

export abstract class BaseEntity {
    name: string;
    value: string;
    waterHeater: IWaterHeater;
    mqtt: MQTT;
    config: EntityConfig;

    abstract sensorType: string;

    constructor(
        name: string,
        waterHeater: IWaterHeater,
        value: string,
        mqtt: MQTT,
        config: EntityConfig = {},
    ) {
        this.name = name;
        this.waterHeater = waterHeater;
        this.value = value;
        this.mqtt = mqtt;
        this.config = config;
    }

    async bootstrap(): Promise<void> {
        await this.publishConfig();
        await this.publishState();
    }

    async updateValue(value: string): Promise<void> {
        this.value = value;
        await this.publishState();
    }

    createConfigTopic(): string {
        const { mqtt_homeassistant_prefix } = CONFIG();
        return `${mqtt_homeassistant_prefix}/${this.sensorType}/${this.waterHeater.deviceId}/${this.name}/config`;
    }

    createStateTopic(): string {
        const { mqtt_prefix } = CONFIG();
        return `${mqtt_prefix}/${this.waterHeater.deviceId}/${this.name}`;
    }

    composeConfig(entityConfig: EntityConfig = {}): EntityConfig {
        const payload: EntityConfig = {
            state_topic: this.createStateTopic(),
            unique_id: `${this.waterHeater.deviceId}-${this.name}`,
            name: READABLE_MAPPING[this.name],
            default_entity_id: `${this.waterHeater.deviceId}_${READABLE_MAPPING[this.name].replaceAll(' ', '_')}`,
            ...entityConfig,
            ...this.waterHeater.generateDeviceConfig(),
        };

        if (this.name in DEVICE_CLASS_MAPPING) {
            payload.device_class = DEVICE_CLASS_MAPPING[this.name];
        }

        return { ...payload, ...this.config };
    }

    async publishConfig(): Promise<void> {
        const topic = this.createConfigTopic();
        LOGGER.trace({ message: 'Publishing config', topic, name: this.name });
        await this.mqtt.publish(topic, JSON.stringify(this.composeConfig()));
    }

    async publishState(): Promise<void> {
        const topic = this.createStateTopic();
        LOGGER.trace({ message: 'Publishing state', topic, name: this.name, value: this.value });
        await this.mqtt.publish(topic, this.value);
    }
}

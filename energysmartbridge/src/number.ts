import { BaseEntity, type EntityConfig, type IWaterHeater } from './baseEntity.js';
import type { MQTT } from './mqtt.js';

export class NumberEntity extends BaseEntity {
    sensorType = 'number';
    min: number;
    max: number;

    constructor(
        name: string,
        waterHeater: IWaterHeater,
        value: string,
        mqtt: MQTT,
        config: EntityConfig = {},
        min: number,
        max: number,
    ) {
        super(name, waterHeater, value, mqtt, config);
        this.min = min;
        this.max = max;
    }

    commandTopic(): string {
        return `energysmartbridge/${this.waterHeater.deviceId}/commands/${this.name}`;
    }

    async bootstrap(): Promise<void> {
        await this.publishConfig();
        await this.mqtt.subscribe(this.commandTopic());
        await this.publishState();
    }

    composeConfig(entityConfig: EntityConfig = {}): EntityConfig {
        return super.composeConfig({
            command_topic: this.commandTopic(),
            min: this.min,
            max: this.max,
            ...entityConfig,
        });
    }
}

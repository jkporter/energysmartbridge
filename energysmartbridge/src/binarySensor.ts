import { BaseEntity, type EntityConfig, type IWaterHeater } from './baseEntity.js';
import type { MQTT } from './mqtt.js';

export class BinarySensor extends BaseEntity {
    sensorType = 'binary_sensor';
    inverse: boolean;

    constructor(
        name: string,
        waterHeater: IWaterHeater,
        value: string,
        mqtt: MQTT,
        config: EntityConfig = {},
        inverse = false,
    ) {
        super(name, waterHeater, value, mqtt, config);
        this.inverse = inverse;
        this.value = this.convertValue(this.value);
    }

    async bootstrap(): Promise<void> {
        await this.publishConfig();
        await this.publishState();
    }

    convertValue(value: string): string {
        switch (value.toUpperCase()) {
            case 'DISABLED':
            case 'FALSE':
            case 'NONE':
            case 'NOTDETECTED':
                return this.inverse ? 'ON' : 'OFF';
            case 'ENABLED':
            case 'TRUE':
            case 'OK':
            case 'DETECTED':
                return this.inverse ? 'OFF' : 'ON';
            default:
                return value;
        }
    }

    async updateValue(value: string): Promise<void> {
        await super.updateValue(this.convertValue(value));
    }
}

import { BaseEntity, type EntityConfig, type IWaterHeater } from './baseEntity.js';
import type { MQTT } from './mqtt.js';

export class Sensor extends BaseEntity {
    sensorType = 'sensor';

    constructor(
        name: string,
        waterHeater: IWaterHeater,
        value: string,
        mqtt: MQTT,
        config: EntityConfig = {},
    ) {
        super(name, waterHeater, value, mqtt, config);
    }
}

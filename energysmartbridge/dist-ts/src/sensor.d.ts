import { BaseEntity, type EntityConfig, type IWaterHeater } from './baseEntity.js';
import type { MQTT } from './mqtt.js';
export declare class Sensor extends BaseEntity {
    sensorType: string;
    constructor(name: string, waterHeater: IWaterHeater, value: string, mqtt: MQTT, config?: EntityConfig);
}
//# sourceMappingURL=sensor.d.ts.map
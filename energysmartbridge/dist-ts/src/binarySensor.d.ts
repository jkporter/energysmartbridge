import { BaseEntity, type EntityConfig, type IWaterHeater } from './baseEntity.js';
import type { MQTT } from './mqtt.js';
export declare class BinarySensor extends BaseEntity {
    sensorType: string;
    inverse: boolean;
    constructor(name: string, waterHeater: IWaterHeater, value: string, mqtt: MQTT, config?: EntityConfig, inverse?: boolean);
    bootstrap(): Promise<void>;
    convertValue(value: string): string;
    updateValue(value: string): Promise<void>;
}
//# sourceMappingURL=binarySensor.d.ts.map
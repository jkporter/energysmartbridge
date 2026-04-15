import { BaseEntity, type EntityConfig, type IWaterHeater } from './baseEntity.js';
import type { MQTT } from './mqtt.js';
export declare class NumberEntity extends BaseEntity {
    sensorType: string;
    min: number;
    max: number;
    constructor(name: string, waterHeater: IWaterHeater, value: string, mqtt: MQTT, config: EntityConfig | undefined, min: number, max: number);
    commandTopic(): string;
    bootstrap(): Promise<void>;
    composeConfig(entityConfig?: EntityConfig): EntityConfig;
}
//# sourceMappingURL=number.d.ts.map
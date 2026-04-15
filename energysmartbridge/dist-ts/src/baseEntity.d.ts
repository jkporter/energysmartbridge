import type { MQTT } from './mqtt.js';
/** Minimal interface of WaterHeater that BaseEntity needs, to avoid circular imports. */
export interface IWaterHeater {
    deviceId: string;
    generateDeviceConfig(): Record<string, unknown>;
}
export type EntityConfig = Record<string, unknown>;
export declare abstract class BaseEntity {
    name: string;
    value: string;
    waterHeater: IWaterHeater;
    mqtt: MQTT;
    config: EntityConfig;
    abstract sensorType: string;
    constructor(name: string, waterHeater: IWaterHeater, value: string, mqtt: MQTT, config?: EntityConfig);
    bootstrap(): Promise<void>;
    updateValue(value: string): Promise<void>;
    createConfigTopic(): string;
    createStateTopic(): string;
    composeConfig(entityConfig?: EntityConfig): EntityConfig;
    publishConfig(): Promise<void>;
    publishState(): Promise<void>;
}
//# sourceMappingURL=baseEntity.d.ts.map
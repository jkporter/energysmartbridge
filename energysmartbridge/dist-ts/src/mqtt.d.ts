import mqtt from 'mqtt';
import type { WaterHeater } from './waterheater.js';
export declare class MQTT {
    connection: mqtt.MqttClient;
    optimistic: boolean;
    constructor(waterHeaters: Record<string, WaterHeater>);
    onError(error: Error): void;
    onMessage(waterHeaters: Record<string, WaterHeater>, topic: string, message: Buffer): void;
    publish(topic: string, payload: string): Promise<void>;
    subscribe(topic: string): Promise<void>;
}
//# sourceMappingURL=mqtt.d.ts.map
import { BaseEntity } from './baseEntity.js';
export class NumberEntity extends BaseEntity {
    sensorType = 'number';
    min;
    max;
    constructor(name, waterHeater, value, mqtt, config = {}, min, max) {
        super(name, waterHeater, value, mqtt, config);
        this.min = min;
        this.max = max;
    }
    commandTopic() {
        return `energysmartbridge/${this.waterHeater.deviceId}/commands/${this.name}`;
    }
    async bootstrap() {
        await this.publishConfig();
        await this.mqtt.subscribe(this.commandTopic());
        await this.publishState();
    }
    composeConfig(entityConfig = {}) {
        return super.composeConfig({
            command_topic: this.commandTopic(),
            min: this.min,
            max: this.max,
            ...entityConfig,
        });
    }
}
//# sourceMappingURL=number.js.map
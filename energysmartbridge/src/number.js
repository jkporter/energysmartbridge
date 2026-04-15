import { BaseSensor } from './baseSensor.js';
import { LOGGER } from './logger.js';
import { DEVICE_CLASS_MAPPING, READABLE_MAPPING } from './mappings.js';

export class NumberSensor extends BaseSensor {
    sensorType = "number";
    min;
    max;

    constructor (name, waterHeater, value, mqtt, options = {}) {
        super(name, waterHeater, value, mqtt, options);

        this.max = options.max || 100;
        this.min = options.min || 1;
    }

    commandTopic () {
        return `energysmartbridge/${this.waterHeater.deviceId}/commands/${this.name}`;
    }

    async bootstrap () {
        await this.publishConfig();

        await this.mqtt.subscribe(this.commandTopic());

        await this.publishState();
    }

    async publishConfig () {
        const payload = {
            state_topic: this.createStateTopic(),
            unique_id: `${this.waterHeater.deviceId}-${this.name}`,
            name: READABLE_MAPPING[this.name],
            object_id: `${this.waterHeater.deviceId}_${READABLE_MAPPING[this.name].replaceAll(" ", "_")}`,
            command_topic: this.commandTopic(),
            min: this.min,
            max: this.max,
            ...this.waterHeater.generateDeviceConfig(),
        };

        if (this.diagnostic) {
            payload.entity_category = 'diagnostic'
        }

        if (this.name in DEVICE_CLASS_MAPPING) {
            payload.device_class = DEVICE_CLASS_MAPPING[this.name];
        }

        const topic = this.createConfigTopic();
        
        LOGGER.trace({message: "Publishing config", topic, name: this.name});

        await this.mqtt.publish(topic, JSON.stringify(payload));
    }
}
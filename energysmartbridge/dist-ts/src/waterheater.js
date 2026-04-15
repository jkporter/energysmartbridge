import { BinarySensor } from './binarySensor.js';
import { LOGGER } from './logger.js';
import { Sensor } from './sensor.js';
import { MAPPING, MODE_MAPPING } from './mappings.js';
import { NumberEntity } from './number.js';
export const COMMAND_MAPPING = {
    mode: 'Mode',
    updateRate: 'UpdateRate',
    temperature: 'SetPoint',
};
export class WaterHeater {
    mqtt;
    pendingCommands;
    sensors = {};
    deviceId;
    moduleAPI;
    moduleFirmwareVersion;
    masterFirmwareVersion;
    masterModelId;
    displayFirmwareVersion;
    wifiFirmwareVersion;
    updateRate;
    mode;
    setPoint;
    units;
    leakDetected;
    maxSetPoint;
    grid;
    airFilterStatus;
    condensePumpFail;
    availableModes = [];
    heating;
    hotWaterVolume;
    leak;
    dryFire;
    elementFail;
    tankSensorFail;
    ecoError;
    masterDisplayFail;
    compressorSensorFail;
    systemSensorFail;
    systemFail;
    upperTemperature;
    lowerTemperature;
    faultCodes;
    unConnectNumber;
    addressData;
    signalStrength;
    constructor(mqtt) {
        this.mqtt = mqtt;
    }
    async bootstrap(queryParams) {
        await this.convertQueryParams(queryParams);
        await this.createHomeAssistantConfig();
        await this.listenForCommands();
    }
    async createUpdateSensor(queryParams, key, 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type, config = {}, ...args) {
        LOGGER.trace({ message: 'Converting key to sensor', key });
        const mappedKey = MAPPING[key];
        if (mappedKey in this.sensors) {
            await this.sensors[mappedKey].updateValue(queryParams[key]);
        }
        else {
            this.sensors[mappedKey] = new type(mappedKey, this, queryParams[key], this.mqtt, config, ...args);
            await this.sensors[mappedKey].bootstrap();
        }
    }
    async convertQueryParams(queryParams) {
        const keys = Object.keys(queryParams);
        // Do device id first since we need it to create all the other sensors
        if (keys.includes('DeviceText')) {
            LOGGER.trace({ message: 'Setting device id', deviceId: queryParams['DeviceText'] });
            this.deviceId = queryParams['DeviceText'];
        }
        // Process Units before the main loop so the unit symbol is available
        // for temperature sensor creation (LowerTemp, UpperTemp, MaxSetPoint)
        if ('Units' in queryParams) {
            this.units = queryParams['Units'];
            LOGGER.trace({ message: 'Got Unit', unit: queryParams['Units'] });
        }
        else {
            LOGGER.warn({ message: 'No Units provided, defaulting to System' });
        }
        const unit = this.units ? `°${this.units}` : undefined;
        for (const key of keys) {
            LOGGER.trace({ message: 'Converting key', key });
            if (key in MAPPING) {
                switch (key) {
                    case 'DeviceText':
                    case 'Units':
                        // Already handled before this loop; skip.
                        break;
                    case 'AvailableModes':
                        this.availableModes = queryParams[key].split(',');
                        break;
                    case 'SetPoint':
                        this.setPoint = parseInt(queryParams[key]);
                        break;
                    case 'Mode':
                        this.mode = queryParams[key];
                        break;
                    case 'Grid':
                    case 'SystemInHeating':
                    case 'Leak':
                    case 'LeakDetect':
                    case 'DryFire':
                    case 'ElementFail':
                    case 'TankSensorFail':
                    case 'EcoError':
                    case 'MasterDispFail':
                    case 'CompSensorFail':
                    case 'SysSensorFail':
                    case 'SystemFail':
                    case 'CondensePumpFail':
                        await this.createUpdateSensor(queryParams, key, BinarySensor);
                        break;
                    case 'AirFilterStatus':
                        await this.createUpdateSensor(queryParams, key, BinarySensor, {}, true);
                        break;
                    case 'FaultCodes':
                    case 'HotWaterVol':
                        await this.createUpdateSensor(queryParams, key, Sensor);
                        break;
                    case 'LowerTemp':
                    case 'UpperTemp':
                    case 'MaxSetPoint':
                        await this.createUpdateSensor(queryParams, key, Sensor, {
                            unit_of_measurement: unit,
                            state_class: 'measurement',
                        });
                        break;
                    case 'ModuleApi':
                    case 'ModFwVer':
                    case 'MasterFwVer':
                    case 'MasterModelId':
                    case 'DisplayFwVer':
                    case 'WifiFwVer':
                    case 'UnConnectNumber':
                    case 'AddrData':
                        await this.createUpdateSensor(queryParams, key, Sensor, {
                            entity_category: 'diagnostic',
                        });
                        break;
                    case 'SignalStrength':
                        await this.createUpdateSensor(queryParams, key, Sensor, {
                            entity_category: 'diagnostic',
                            unit_of_measurement: 'dBm',
                            state_class: 'measurement',
                        });
                        break;
                    case 'UpdateRate':
                        await this.createUpdateSensor(queryParams, key, NumberEntity, { entity_category: 'config', unit_of_measurement: 's', optimistic: this.mqtt.optimistic }, 30, 600);
                        break;
                    default:
                        break;
                }
            }
        }
        await this.updateMQTTData();
    }
    updatePendingCommands(key, value) {
        if (key in COMMAND_MAPPING) {
            if (!this.pendingCommands) {
                this.pendingCommands = {};
            }
            switch (key) {
                case 'temperature':
                    this.pendingCommands[COMMAND_MAPPING[key]] = parseInt(value).toFixed(0);
                    break;
                default:
                    this.pendingCommands[COMMAND_MAPPING[key]] = value;
            }
        }
        LOGGER.trace({ message: 'Updated Pending Commands', pendingCommands: this.pendingCommands });
    }
    toResponse() {
        const response = {
            Success: '0',
            ...this.pendingCommands,
        };
        delete this.pendingCommands;
        return response;
    }
    generateDeviceConfig() {
        return {
            device: {
                identifiers: [this.deviceId],
                connections: [['mac', this.deviceId.match(/.{1,2}/g).join(':')]],
                name: `Hot Water Heater ${this.deviceId}`,
                model_id: this.masterModelId,
                sw_version: this.masterFirmwareVersion,
            },
        };
    }
    generateModeMappingTemplate(inverse) {
        const mapping = {};
        for (const mode of this.availableModes) {
            if (mode in MODE_MAPPING) {
                if (inverse) {
                    mapping[MODE_MAPPING[mode]] = mode;
                }
                else {
                    mapping[mode] = MODE_MAPPING[mode];
                }
            }
        }
        return `{% set lookup = ${JSON.stringify(mapping)} %}{{- lookup[value] -}}`;
    }
    async listenForCommands() {
        await this.mqtt.subscribe(`energysmartbridge/${this.deviceId}/commands/temperature`);
        await this.mqtt.subscribe(`energysmartbridge/${this.deviceId}/commands/mode`);
    }
    async createHomeAssistantConfig() {
        await this.mqtt.publish(`homeassistant/water_heater/${this.deviceId}/config`, JSON.stringify({
            // Mode Config
            mode_state_topic: `energysmartbridge/${this.deviceId}/mode`,
            mode_state_template: this.generateModeMappingTemplate(false),
            modes: this.availableModes
                .filter((mode) => mode in MODE_MAPPING)
                .map((mode) => MODE_MAPPING[mode]),
            mode_command_topic: `energysmartbridge/${this.deviceId}/commands/mode`,
            mode_command_template: this.generateModeMappingTemplate(true),
            optimistic: this.mqtt.optimistic,
            // Temperature
            temperature_state_topic: `energysmartbridge/${this.deviceId}/set_point`,
            temperature_command_topic: `energysmartbridge/${this.deviceId}/commands/temperature`,
            current_temperature_topic: `energysmartbridge/${this.deviceId}/current_temperature`,
            max_temp: this.maxSetPoint,
            temperature_unit: this.units,
            unique_id: `${this.deviceId}_water_heater`,
            ...this.generateDeviceConfig(),
        }));
    }
    async updateMQTTData() {
        const lower = this.sensors['lowerTemperature'];
        const upper = this.sensors['upperTemperature'];
        if (lower && upper) {
            const avg = ((parseInt(lower.value) + parseInt(upper.value)) / 2).toFixed(0);
            await this.mqtt.publish(`energysmartbridge/${this.deviceId}/current_temperature`, avg);
        }
        if (!this.mqtt.optimistic ||
            !this.pendingCommands ||
            this.pendingCommands[COMMAND_MAPPING['mode']] == null) {
            await this.mqtt.publish(`energysmartbridge/${this.deviceId}/mode`, this.mode ?? '');
        }
        if (this.setPoint != null &&
            (!this.mqtt.optimistic ||
                !this.pendingCommands ||
                this.pendingCommands[COMMAND_MAPPING['temperature']] == null)) {
            await this.mqtt.publish(`energysmartbridge/${this.deviceId}/set_point`, this.setPoint.toString());
        }
    }
}
//# sourceMappingURL=waterheater.js.map
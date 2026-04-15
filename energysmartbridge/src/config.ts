import fs from 'node:fs';

export interface AppConfig {
    mqtt_host: string;
    mqtt_port: number;
    mqtt_username: string;
    mqtt_password: string;
    mqtt_prefix: string;
    mqtt_homeassistant_prefix: string;
    mqtt_optimistic: boolean;
    log_level: 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace';
}

let CONFIG_CACHE: AppConfig | undefined;

export const CONFIG = (): AppConfig => {
    if (!CONFIG_CACHE) {
        CONFIG_CACHE = loadConfig();
    }

    return CONFIG_CACHE;
};

const loadConfig = (): AppConfig =>
    JSON.parse(fs.readFileSync(process.env.CONFIG_PATH ?? './config.json', 'utf8')) as AppConfig;

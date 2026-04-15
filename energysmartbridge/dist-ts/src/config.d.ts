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
export declare const CONFIG: () => AppConfig;
//# sourceMappingURL=config.d.ts.map
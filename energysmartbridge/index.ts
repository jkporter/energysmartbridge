import express from 'express';
import bodyParser from 'body-parser';
import { CONFIG } from './src/config.js';
import { LOGGER } from './src/logger.js';
import { WaterHeater } from './src/waterheater.js';
import { MQTT } from './src/mqtt.js';

LOGGER.debug({ message: 'Loaded Config', CONFIG });

const WATER_HEATERS: Record<string, WaterHeater> = {};
const MQTT_BROKER = new MQTT(WATER_HEATERS);

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json()); // support json encoded bodies
app.use(express.urlencoded({ extended: true })); // support encoded bodies

const getCreateWaterHeater = async (
    queryParams: Record<string, string>,
): Promise<WaterHeater> => {
    const deviceId = queryParams['DeviceText'];

    if (deviceId in WATER_HEATERS) {
        await WATER_HEATERS[deviceId].convertQueryParams(queryParams);
        return WATER_HEATERS[deviceId];
    } else {
        const waterHeater = new WaterHeater(MQTT_BROKER);
        await waterHeater.bootstrap(queryParams);
        WATER_HEATERS[deviceId] = waterHeater;
        return waterHeater;
    }
};

app.use(async (req, res) => {
    // ignore empty payloads
    if (Object.keys((req.body as Record<string, unknown>) ?? {}).length === 0) {
        return;
    }

    LOGGER.debug({ message: 'Got Request', body: req.body, path: req.path });
    const waterHeater = await getCreateWaterHeater(req.body as Record<string, string>);
    res.status(200).end(JSON.stringify(waterHeater.toResponse()));
});

app.listen(8001);

LOGGER.info({ message: 'Server listening on 8001' });

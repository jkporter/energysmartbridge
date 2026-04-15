import fs from 'node:fs';
let CONFIG_CACHE;
export const CONFIG = () => {
    if (!CONFIG_CACHE) {
        CONFIG_CACHE = loadConfig();
    }
    return CONFIG_CACHE;
};
const loadConfig = () => JSON.parse(fs.readFileSync(process.env.CONFIG_PATH ?? './config.json', 'utf8'));
//# sourceMappingURL=config.js.map
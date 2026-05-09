
import { SettingsManager } from "../api/settingsManager"

// Isto é para guardar as settings em cache, mas podes enviar a data das settings como arg pois podemos nao querer chatear a backend com pedido de volta
// no contexto atual


async function setSettings() {

    
        try {
            const settings = await SettingsManager.fetchSettings();
            settingsData.SETTINGS = SettingsManager.readSettingsJSON(settings);
        }
        catch (error) {
            console.error("Error fetching settings:", error);
            settingsData.SETTINGS = null;
        }
}

async function setSettings(data) {
    settingsData.SETTINGS = SettingsManager.readSettingsJSON(data);
}


export const settingsData = {
    SETTINGS: defaultSettings,
}

/* Nada Suspeito, Nada Default 👀, ⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠟⠛⠛⠛⠛⠛⠉⠙⠛⠻⢿⣿⣿⣿⣿⣿⣿⣿⣿ 
⣿⣿⣿⣿⣿⣿⣿⣿⡿⠋⠀⢀⣤⣶⣦⣤⣤⣤⣤⣄⡀⠀⠈⠛⢿⣿⣿⣿⣿⣿ 
⣿⣿⣿⣿⣿⣿⣿⣿⠃⠀⣴⣿⣿⣿⣿⣿⣿⣿⡿⠿⠿⣷⡄⠀⠀⢻⣿⣿⣿⣿ 
⣿⣿⣿⣿⣿⣿⣿⠇⠀⢰⣿⣿⣿⠟⠉⠁⠀⠀⠀⣀⣀⣀⡀⠀⠀⠀⠻⣿⣿⣿ 
⣿⣿⣿⣿⣿⣿⣿⠀⠀⣾⣿⣿⡏⠀⠀⠐⣾⣿⣿⣿⣿⣿⣿⣿⣷⣦⡀⠈⢻⣿ 
⣿⣿⠿⠛⠋⠉⠉⠀⢠⣿⣿⣿⡇⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠈⣿ 
⣿⡏⠀⢠⣴⣶⠆⠀⢸⣿⣿⣿⣧⠀⠀⠀⠀⠈⠙⠛⠛⠛⠉⠉⠉⠉⠀⠀⠀⣿ 
⣿⡇⠀⢸⣿⣿⠀⠀⢸⣿⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣼⣿ 
⣿⠇⠀⢸⣿⣿⠀⠀⢸⣿⣿⣿⣿⣿⣶⣄⣀⠀⠀⠀⠀⢀⣀⣀⣤⡄⠀⢸⣿⣿ 
⣿⠀⠀⣾⣿⣿⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠘⣿⣿ 
⣿⠀⠀⣿⣿⣿⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⣿⣿ 
⣿⠀⠀⣿⣿⣿⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⠀⣿⣿ 
⣿⡀⠀⢹⣿⣿⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡇⠀⢸⣿⣿ 
⣿⣇⠀⠘⢿⣿⠀⠀⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠀⠀⣼⣿⣿ 
⣿⣿⣤⡀⠀⠀⠀⠀⠸⣿⣿⣿⣿⣿⠏⠀⠀⠈⠉⠉⠉⠉⣉⣿⡟⠀⠀⣿⣿⣿ 
⣿⣿⣿⣿⣿⣿⣿⠀⠀⣿⣿⣿⣿⣿⠀⠀⢸⣿⠂⠀⢰⣾⣿⣿⡇⠀⢸⣿⣿⣿ 
⣿⣿⣿⣿⣿⣿⣿⠀⠀⣿⣿⣿⣿⣿⠀⠀⢸⣿⡆⠀⢹⣿⣿⣿⠇⠀⣸⣿⣿⣿ 
⣿⣿⣿⣿⣿⣿⣿⡀⠀⠙⠻⠿⠟⠋⠀⠀⣾⣿⣷⣄⠀⠀⠀⠀⢀⣰⣿⣿⣿⣿ 
⣿⣿⣿⣿⣿⣿⣿⣷⣤⣄⣀⣀⣀⣀⣴⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
*/


//https://discord.gg/kBy77ybj


const defaultSettings = {
    "DALTONISM": false,
    "DARK_MODE": false,
    "LANGUAGE": "en",
    "MINDAYS": 0,
    "MAXDAYS": 22
}

import {cache} from 'react';



export const SettingsManager = {

    fetchSettings: () => {
        return apiClient.request(`/api/settings`,`GET`); 
    },

    sendSettingsJSON: (data) => {
        const jsonString = JSON.stringify(data, null, null);

        return apiClient.request(`/api/settings`,`POST`,jsonString);  
    },

    readSettingsJSON: (data) => {


        if (typeof data === 'string') {
            // validem a puta dos dados, nao passem aqui bombastic garbage, otherwise this shit will break faster than my balls rolling on glass shards
            return cache(JSON.parse(data));
        }else if (typeof data === 'object') {
            return cache(data);
        }
        return null;
    }
}



import React, { useState, useEffect } from 'react';

export const DaltonismModes = {
    DEUTERANOMALY : 0,
    PROTONOMALY : 1,
    DEUTERANOPIA : 2,
    PROTANOPIA : 3,
};

const defaultSettings = {
    DALTONISM: false,
    DALTONISM_MODE: DaltonismModes.DEUTERANOMALY,
    DARK_MODE: false,
    LANGUAGE: "en"
};

export const SettingsManager = {

// guarda as definicoes, const defaultSettings e um exemplo do objeto
// retorna true or false se a operacao teve successo ou nao
    SaveSettings: (data) => {
        if (typeof data === 'object') {
            if(SettingsManager.ValidateSettingsObj(data)){
                localStorage.setItem("SETTINGS",JSON.stringify(data));
                window.dispatchEvent(new CustomEvent('settings-changed'));
                return true;
            }
        } 
        console.log("Envia um objeto valido de opcoes");
        return false;
    },
    GetSettings: () => {
        const settings = JSON.parse(localStorage.getItem("SETTINGS"));
        if (settings == null) {
            SettingsManager.SaveSettings(defaultSettings);
            return defaultSettings
        }
        return settings
    },
    GetSetting: (key) => {
        if (SettingsManager.GetSettings()[key] != null){
            return SettingsManager.GetSettings()[key]
        } else {
            console.log("Essa opcao nao existe");
        }
    },

    // esta validacao e mt harsh pois settings antigas sao nuked, caso a app deia update com novas settings, mas fodase tbh
    ValidateSettingsObj: (obj) =>
    {
        if (JSON.stringify(Object.keys(defaultSettings).sort()) ===
            JSON.stringify(Object.keys(obj).sort())){
            return true
        } else {
            console.log(`As keys das settings recebidas ${Object.keys(obj)}`);
            console.log(`As keys das settings esperadas ${Object.keys(defaultSettings)}`);
            return false
        }
    }
};








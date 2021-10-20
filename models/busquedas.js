const fs = require('fs');
const axios = require('axios');


// const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/valencia.json?limit=6&language=es&access_token=pk.eyJ1IjoiaWZyZWRkeTE4IiwiYSI6ImNrdXk0aHozNzBkbWoydnRjdGEwbWloODkifQ.EWfCRAIKt_hyMx3uVFxxHQ';
class Busquedas {

    constructor() {
        this.historial = [];
        this.dbPath = './db/database.json';
        this.leerDB();
    }

    get historialCapitalizado() {

        return this.historial.map( lugar => {

            // *** Mi solucion ***
            // const words = lugar.split(' ');
            // let lugarCap = '';

            // words.forEach( word => {
            //     const wordCamelCase = word.substring(0, 1).toUpperCase() + word.substring(1);
            //     lugarCap += wordCamelCase + ' ';
            // });
            
            // return lugarCap;

            // Solucion del curso
            let words = lugar.split(' ');
            words = words.map( p => p[0].toUpperCase() + p.substring(1));

            return words.join('');

        });

    }

    get paramsMapbox() {
        return {
            access_token: process.env.MAPBOX_KEY,
            limit: 5,
            language: 'es',
        };
    }

    get paramsOpenWeather() {
        return {
            units: 'metric',
            lang: 'es',
            appid: process.env.OPENWEATHER_KEY,
        };
    }

    async ciudad( lugar = '' ) {
        
        try {
            // Peticion http
            const instance = axios.create({
                baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${ lugar }.json`,
                params: this.paramsMapbox
            });

            const resp = await instance.get();

            return resp.data.features.map( place => (
                {
                    id: place.id,
                    name: place.place_name_es,
                    lng: place.center[0],
                    lat: place.center[1],
                }
            ));

        } catch (error) {
            return [];
        }

    }

    async clima(lat = '', lon = '') {
        try {
            // Peticion http
            const instance = axios.create({
                baseURL: 'https://api.openweathermap.org/data/2.5/weather',
                params: { ...this.paramsOpenWeather, lat, lon }
            });

            const resp = await instance.get();
            const { description } = resp.data.weather[0];
            const { temp, temp_min, temp_max } = resp.data.main;

            return {
                desc: description,
                temp,
                temp_min,
                temp_max,
            };

        } catch (error) {
            return [error];
        }
    }

    agregarHistorial( lugar = '' ) {

        if ( this.historial.includes( lugar.toLocaleLowerCase())) {
            return;
        }

        this.historial.splice(0, 5); // Para que solo aparezcan 6 resultados

        this.historial.unshift( lugar.toLocaleLowerCase() );

        // GrabarDB
        this.guardarDB();

    }

    guardarDB() {

        const payload = {
            historial: this.historial
        };

        fs.writeFileSync(this.dbPath, JSON.stringify( payload ));
    }

    leerDB() {

        if ( !fs.existsSync (this.dbPath)) return;
        
        const info = fs.readFileSync(this.dbPath, { encoding: 'utf-8' });
        const data = JSON.parse(info);
        this.historial = data.historial;

    }


}

module.exports = Busquedas;
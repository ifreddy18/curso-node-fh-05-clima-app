require('dotenv').config();
require('colors');

const { leerInput, inquirerMenu, pausa, listadoLugares } = require('./helpers/inquirer');
const Busquedas = require('./models/busquedas');


const main = async() => {

    
    const busquedas = new Busquedas();
    let opt;

    do {

        opt = await inquirerMenu();

        switch ( opt ) {
            case 1:
                // Mostrar mensajes
                const termino = await leerInput('Ciudad a buscar: ');
                
                // Buscar los lugares
                const lugares = await busquedas.ciudad(termino);
                
                // Seleccionar el lugar 
                const id = await listadoLugares(lugares);
               
                if ( id === 0 ) continue;

                // GuardarDB
                const lugarSeleccionado = lugares.find( l => l.id === id);
                busquedas.agregarHistorial(lugarSeleccionado.name);

                // Clima
                const { name, lat, lng } = lugarSeleccionado;
                const { desc, temp, temp_min, temp_max } = await busquedas.clima(lat, lng);

                // Mostrar lugar
                console.log('\nInformación de la ciudad\n'.green);
                console.log('Ciudad: ', name);
                console.log('Lat: ', lat);
                console.log('Lng: ', lng);
                console.log('Desc: ', desc);
                console.log('Temp: ', temp);
                console.log('Temp (min): ', temp_min);
                console.log('Temp (máx): ', temp_max);

                break;
            
            case 2:
                busquedas.historialCapitalizado.forEach(( place, i ) => {
                    const idx = `${ i + 1 }.`.green;
                    console.log(`${ idx } ${ place }`);
                });
                
                break;
            
            case 0:
                break;
        }

        if ( opt !== 0 ) await pausa();

    } while ( opt !== 0 );


};

main();

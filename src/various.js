const fs = require('fs');

const sleep = (milliseconds) => {
    return new Promise(resolve => setTimeout(resolve, milliseconds))
}

const msToMinAndSecs = (millis) => {
    const minutes = Math.floor(millis / 60000);
    const seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


const msToTime = (duration) => {

    var seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
}


const counter = (array) => {
    //Sumamos todos los items
    const totalItems = array.reduce(function (a, b) { return parseFloat(a) + parseFloat(b); })
    //Calculamos las requests que requerimos y las sumamos
    const totalRequests = array
        .map(el => Math.ceil(el / 50))
        .reduce(function (a, b) { return a + b; })

    return [totalItems, totalRequests]
}

//Devuelve un array con los items del nuevo array que no estuvieran en el array anterior.
const arrayFilter = (arrayPrev, arrayActual) => {
    const res = arrayActual.filter(item => !arrayPrev.includes(item));

    return res
}

//Crea esta estructura si no existe:
// └───results
//     ├───extension
//     └───raw
const createDirs = () => {
    const dirRaw = './results/raw';
    const dirExtension = './results/extension';

    if (!fs.existsSync(dirRaw)) {
        fs.mkdirSync(dirRaw, { recursive: true });
    }

    if (!fs.existsSync(dirExtension)) {
        fs.mkdirSync(dirExtension, { recursive: true });
    }
}



exports.sleep = sleep
exports.msToMinAndSecs = msToMinAndSecs
exports.msToTime = msToTime
exports.counter = counter
exports.arrayFilter = arrayFilter
exports.createDirs = createDirs





/*!

//-> En index.js
const saludos = require("./test")

saludos.hola1()
saludos.adios()
*/
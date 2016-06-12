// Lets use babel for ESNext features
require('babel/register');

const scrape = require('./app/modules/scrape.js');

scrape.fetchNumerosRestriccion()
  .then(function(datosRestriccion) {
    console.log('First scrape ok!', datosRestriccion);
  });

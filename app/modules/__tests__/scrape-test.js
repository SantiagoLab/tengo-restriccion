import chai from 'chai';
import * as scrape from '../scrape.js';
chai.use(require('chai-as-promised'));
chai.should();


describe('scrape', () => {
  describe('#parseNumerosRestriccion', () => {
    const emergencia = [
      'Martes 25 de Junio: sin sello verde 5-6-7-8-9-0-1-2, con sello verde 1-2-3-4',
      'Emergencia Ambiental'];
    const preemergencia = [
      'Viernes 3 de Julio: sin sello verde 1-2-3-4 -9-0, con sello verde 7-8',
      'Preemergencia Ambiental'];
    const alerta = [
      'Domingo 21 de Junio: sin sello verde 7-8-9-0, con sello verde sin restriccion',
      'Alerta Ambiental'];
    const normal = ['Lunes 6 de Julio: sin sello verde 5-6-7-8', 'Restricción Vehicular'];
    const noAplica = ['Sábado 1 de Agosto:  No aplica', 'Restricción Vehicular'];
    const noRige = ['Martes 1 de Septiembre: sin sello verde No rige', 'Restricción Vehicular'];
    const sinRestriccion = ['Jueves 27 de Marzo:Sin restricción', 'Restricción Vehicular'];

    const bug1 = ['Sábado 19 de Julio: sin sello verde  1-2', 'Alerta Ambiental'];
    const bug2 = ['Martes 18 de Julio:  sin sello verde 9-0-1-2', 'Restricción Vehicular'];
    const bug3 = ['Domingo 12 de Junio: sin sello verde  1 - 2','Alerta Ambiental'];
    const bug4 = [
      'Miercoles 27 de Junio: sin sello verde 1-2-3-4 , con sello verde No aplica',
      'Alerta Ambiental'
    ];

    const parseNumerosRestriccion = scrape.parseNumerosRestriccion;


    const numerosEmergencia     = parseNumerosRestriccion(emergencia);
    const numerosPreemergencia  = parseNumerosRestriccion(preemergencia);
    const numerosAlerta         = parseNumerosRestriccion(alerta);
    const numerosNormal         = parseNumerosRestriccion(normal);
    const numerosNoAplica       = parseNumerosRestriccion(noAplica);
    const numerosNoRige         = parseNumerosRestriccion(noRige);
    const numerosBug1           = parseNumerosRestriccion(bug1);
    const numerosBug2           = parseNumerosRestriccion(bug2);
    const numerosBug3           = parseNumerosRestriccion(bug3);
    const numerosBug4           = parseNumerosRestriccion(bug4);
    const numerosSinRestriccion = parseNumerosRestriccion(sinRestriccion);

    // Make sure that the day is correct, but we 'ignore' the rest,
    // because of parseNumerosRestriccion implementation
    const fechaEmergencia     = new Date((new Date(numerosEmergencia.fecha.getTime())).setDate(25));
    const fechaPreemergencia  = new Date((new Date(numerosPreemergencia.fecha.getTime())).setDate(3));
    const fechaAlerta         = new Date((new Date(numerosAlerta.fecha.getTime())).setDate(21));
    const fechaNormal         = new Date((new Date(numerosNormal.fecha.getTime())).setDate(6));
    const fechaNoAplica       = new Date((new Date(numerosNoAplica.fecha.getTime())).setDate(1));
    const fechaNoRige         = new Date((new Date(numerosNoRige.fecha.getTime())).setDate(1));
    const fechaBug1           = new Date((new Date(numerosBug1.fecha.getTime())).setDate(19));
    const fechaBug2           = new Date((new Date(numerosBug2.fecha.getTime())).setDate(18));
    const fechaBug3           = new Date((new Date(numerosBug2.fecha.getTime())).setDate(12));
    const fechaBug4           = new Date((new Date(numerosBug2.fecha.getTime())).setDate(27));
    const fechaSinRestriccion = new Date((new Date(numerosSinRestriccion.fecha.getTime())).setDate(27));

    it('should return expected result for Emergencia', () => {
      numerosEmergencia
        .should.be.deep.equal({
          fecha  : fechaEmergencia,
          estatus: 'Emergencia Ambiental',
          numeros: {
            conSello: [1, 2, 3, 4],
            sinSello: [5, 6, 7, 8, 9, 0, 1, 2]
          }
        });

      numerosEmergencia
        .should.not.be.deep.equal({
          fecha  : fechaEmergencia,
          estatus: 'Emergtal',
          numeros: {
            conSello: [1, 1, 1],
            sinSello: [2, 9, 4, 2]
          }
        });
    });

    it('should return expected result for Preemergencia', () => {
      numerosPreemergencia
        .should.be.deep.equal({
          fecha  : fechaPreemergencia,
          estatus: 'Preemergencia Ambiental',
          numeros: {
            conSello: [7, 8],
            sinSello: [1, 2, 3, 4, 9, 0]
          }
        });

      numerosPreemergencia
        .should.not.be.deep.equal({
          fecha  : fechaPreemergencia,
          estatus: 'Prial',
          numeros: {
            conSello: [],
            sinSello: [8, 8]
          }
        });
    });

    it('should return expected result for Alerta', () => {
      numerosAlerta
        .should.be.deep.equal({
          fecha  : fechaAlerta,
          estatus: 'Alerta Ambiental',
          numeros: {
            conSello: [],
            sinSello: [7, 8, 9, 0]
          }
        });

      numerosAlerta
        .should.not.be.deep.equal({
          fecha  : fechaAlerta,
          estatus: 'Alertal',
          numeros: {
            conSello: [3, 3],
            sinSello: [9, 9, 9]
          }
        });
    });

    it('should return expected result for Normal', () => {
      numerosNormal
        .should.be.deep.equal({
          fecha  : fechaNormal,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [],
            sinSello: [5, 6, 7, 8]
          }
        });

      numerosNormal
        .should.not.be.deep.equal({
          fecha  : fechaNormal,
          estatus: 'Restar',
          numeros: {
            conSello: [],
            sinSello: [9, 3, 2, 4]
          }
        });
    });

    it('should return expected result for No Aplica', () => {
      numerosNoAplica
        .should.be.deep.equal({
          fecha  : fechaNoAplica,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [],
            sinSello: []
          }
        });

      numerosNoAplica
        .should.not.be.deep.equal({
          fecha  : fechaNormal,
          estatus: 'Restar',
          numeros: {
            conSello: [],
            sinSello: [9, 3, 2, 4]
          }
        });
    });

    it('should return expected result for No Rige', () => {
      numerosNoRige
        .should.be.deep.equal({
          fecha  : fechaNoRige,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [],
            sinSello: []
          }
        });

      numerosNoRige
        .should.not.be.deep.equal({
          fecha  : fechaNormal,
          estatus: 'Restar',
          numeros: {
            conSello: [],
            sinSello: [9, 3, 2, 4]
          }
        });
    });

    it('should return expected result for SinRestriccion case', () => {
      numerosSinRestriccion
        .should.be.deep.equal({
          fecha  : fechaSinRestriccion,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [],
            sinSello: []
          }
        });

      numerosSinRestriccion
        .should.not.be.deep.equal({
          fecha  : fechaSinRestriccion,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [],
            sinSello: [3, 1]
          }
        });
    });

    it('should return expected result for Bug1 case', () => {
      numerosBug1
        .should.be.deep.equal({
          fecha  : fechaBug1,
          estatus: 'Alerta Ambiental',
          numeros: {
            conSello: [],
            sinSello: [1, 2]
          }
        });

      numerosBug1
        .should.not.be.deep.equal({
          fecha  : fechaBug1,
          estatus: 'Alertental',
          numeros: {
            conSello: [],
            sinSello: [3, 1]
          }
        });
    });

    it('should return expected result for Bug2 case', () => {
      numerosBug2
        .should.be.deep.equal({
          fecha  : fechaBug2,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [],
            sinSello: [9, 0, 1, 2]
          }
        });

      numerosBug2
        .should.not.be.deep.equal({
          fecha  : fechaBug2,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [],
            sinSello: [3, 1]
          }
        });
    });

    it('should return expected result for Bug3 case', () => {
      numerosBug3
        .should.be.deep.equal({
          fecha  : fechaBug3,
          estatus: 'Alerta Ambiental',
          numeros: {
            conSello: [],
            sinSello: [1, 2]
          }
        });

      numerosBug3
        .should.not.be.deep.equal({
          fecha  : fechaBug3,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [],
            sinSello: [3, 4]
          }
        });
    });


    it('should return expected result for Bug4 case', () => {
      numerosBug4
        .should.be.deep.equal({
          fecha  : fechaBug4,
          estatus: 'Alerta Ambiental',
          numeros: {
            conSello: [],
            sinSello: [1, 2, 3, 4]
          }
        });

      numerosBug4
        .should.not.be.deep.equal({
          fecha  : fechaBug4,
          estatus: 'Restricción Vehicular',
          numeros: {
            conSello: [1, 2],
            sinSello: [3, 4]
          }
        });
    });


    it('object should have formated "numeros"', () => {
      parseNumerosRestriccion(emergencia)
          .should.have.deep.property('numeros.conSello')
          .and.be.a('array');

      parseNumerosRestriccion(preemergencia)
          .should.have.deep.property('numeros.conSello')
          .and.be.a('array');

      parseNumerosRestriccion(alerta)
          .should.have.deep.property('numeros.conSello')
          .and.be.a('array');

      parseNumerosRestriccion(emergencia)
          .should.have.deep.property('numeros.sinSello')
          .and.be.a('array');

      parseNumerosRestriccion(preemergencia)
          .should.have.deep.property('numeros.sinSello')
          .and.be.a('array');

      parseNumerosRestriccion(alerta)
          .should.have.deep.property('numeros.sinSello')
          .and.be.a('array');
    });


    it('object should have proper "fecha" type', () => {
      const fechaInvalida =
              ['fechaErronea: sin sello verde 5-6-7-8-9-0-1-2, con sello verde 1-2-3-4', 'Emergencia Ambiental'];

      parseNumerosRestriccion(emergencia).should
              .have.property('fecha')
              .and.be.a('date');

      parseNumerosRestriccion(preemergencia).should
              .have.property('fecha')
              .and.be.a('date');

      parseNumerosRestriccion(alerta).should
              .have.property('fecha')
              .and.be.a('date');

      (() => { parseNumerosRestriccion(fechaInvalida); })
                        .should.throw(/Couldn't get 'fecha' while scraping/);
    });


    it('object should have proper "estatus" type', () => {
      parseNumerosRestriccion(emergencia).should
              .have.property('estatus')
              .and.to.match(/ambiental/i);

      parseNumerosRestriccion(preemergencia).should
              .have.property('estatus')
              .and.to.match(/ambiental/i);

      parseNumerosRestriccion(alerta).should
              .have.property('estatus')
              .and.to.match(/ambiental/i);
    });
  });


  describe('#scrapeNumerosRestriccion()', () => {
    var scrapeNumerosRestriccion = scrape.scrapeNumerosRestriccion();


    it('finds dom node', () => {
      return scrapeNumerosRestriccion.should.eventually
              .be.a('array')
              .and.to.have.length.above(0);
    });


    it('returns expected "estatus" text pattern', () => {
      return scrapeNumerosRestriccion.should.eventually
              .have.property(1)
              .and.to.match(/^(.*\bambiental|Restricción Vehicular)$/i);
    });
  });
});

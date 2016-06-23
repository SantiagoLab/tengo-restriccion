import {cleanUpAfterEach} from '../../utils/testDbHelper.js';
import chai from 'chai';
import * as User from '../../models/User.js';
import {app} from '../../../server.js';
import request from 'supertest-as-promised';
chai.should();


describe('userController', () => {

  cleanUpAfterEach(User.model);

  describe('create', () => {

    it('should register a valid user', done => {
      const usuarioValido = { email: 'one@gmail.com', notify: true, selloVerde: true, numeroRestriccion: 1 };

      request(app.listen())
        .put('/users')
        .send(usuarioValido)
        .expect(201)
        .end(done);
    });

    it('should not register with an used email', done => {
      const usuarioValido = { email: 'one@gmail.com', notify: true, selloVerde: true, numeroRestriccion: 1 };

      request(app.listen())
        .put('/users')
        .send(usuarioValido)
        .expect(201)
        .then( () => {
          request(app.listen())
            .put('/users')
            .send(usuarioValido)
            .expect(409)
            .end(done);
        });
    });

    it('should not register an invalid user', done => {
      const usuarioInvalido = { email: 'oneil.com', notify: true, selloVerde: true, numeroRestriccion: 1 };

      request(app.listen())
        .put('/users')
        .send(usuarioInvalido)
        .expect(500)
        .end(done);
    });
  });

  describe('unSubscribe', () => {
    it('should unsubscribe a user', done => {
      const usuarioValido = { email: 'unsubscribe@gmail.com', notify: true, selloVerde: true, numeroRestriccion: 1 };
      User.create(usuarioValido)
      .then(function(){
        return User.find('unsubscribe@gmail.com');
      })
      .then(user => {
        request(app.listen())
          .get('/unsubscribe?email=' + user.email + '&token=' + user.token )
          .expect(302)
          .expect('Redirecting to <a href="/unsubscribe-success.html">' +
                  '/unsubscribe-success.html</a>.')
          .end(done);
      });
    });

    it('should not unSubscribe user with wrong token', done => {
      const usuarioValido = { email: 'unsubscribe@gmail.com', notify: true, selloVerde: true, numeroRestriccion: 1 };
      User.create(usuarioValido)
      .then(function(){
        return User.find('unsubscribe@gmail.com');
      })
      .then(user => {
        request(app.listen())
          .get('/unsubscribe?email=' + user.email + '&token=ABC')
          .expect(302)
          .expect('Redirecting to <a href="/unsubscribe-error.html">/unsubscribe-error.html</a>.')
          .end(done);
      });
    });

    it('should not unSubscribe user with wrong email', done => {
      const usuarioValido = { email: 'unsubscribe@gmail.com', notify: true, selloVerde: true, numeroRestriccion: 1 };
      User.create(usuarioValido)
      .then(function(){
        return User.find('unsubscribe@gmail.com');
      })
      .then(user => {
        request(app.listen())
          .get('/unsubscribe?email=ABC&token=' + user.token )
          .expect(302)
          .expect('Redirecting to <a href="/unsubscribe-error.html">/unsubscribe-error.html</a>.')
          .end(done);
      });
    });

  });

});

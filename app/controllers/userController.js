import * as User from '../models/User';
import {log} from '../modules/logger';
// import {addWelcomeEmailJob} from '../jobs/welcomeEmailJob';
import {sendWelcomeEmail} from '../modules/mailSender';
import {__PRODUCTION__} from '../config/envs';

export function* create(){
  const query = this.request.body;
  this.type = 'application/json';

  try{
    const user = yield User.create(query);

    // Send welcome email
    if (__PRODUCTION__) {
      // this job can get in a loop, disabling until we find a solution
      // addWelcomeEmailJob(user);
      sendWelcomeEmail(user)
        .then(result => {
          log.info({'sendWelcomeEmail': {status: 'complete', result }});
        })
        .catch(err => {
          log.error({'sendWelcomeEmail': {status: 'failed', error: err }});
        });
    }

    this.status = 201;
    this.body = user;
  }
  catch(error){
    log.error({'userController#create': { query, error }});

    if (/duplicate key error index.*email/.test(error)) {
      this.status = 409;
      this.body = {
        errors: [
          {
            status     : this.status,
            title      : 'Ya registrado',
            description: 'El email que ingresaste ya está registrado. Intenta con otro email'
          }]};
    } else {
      this.status = 500;
      this.body = {
        errors: [
          {
            status     : this.status,
            title      : 'Error al crear el Usuario',
            description: 'No Pudimos crear el Usuario. Revisa tus datos e intenta nuevamente!'
          }
        ]
      };
    }
  }
}


export function* unsubscribe(){
  try{
    const paramEmail = this.request.query.email;
    const paramToken = this.request.query.token;

    const user = yield User.find({email: paramEmail});

    if(user.token !== paramToken){
      throw Error('Token inválido!');
    }

    const uns = yield User.unSubscribe(user.email);

    if(uns.nModified !== 1){
      throw Error('Error al cancelar subscripción!');
    }

    this.status = 200;
    this.redirect('/unsubscribe-success.html');
  }
  catch(error){
    this.status = 400;
    this.redirect('/unsubscribe-error.html');
  }
}

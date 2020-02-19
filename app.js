const feathers = require('@feathersjs/feathers');
const express = require('@feathersjs/express');
const socketio = require('@feathersjs/socketio');
var moesifExpress = require('moesif-express');
var superagent = require('superagent');

// Set the options, the only required field is applicationId.
var moesifOptions = {

    applicationId: process.env.MOESIF_APPLICATION_ID || 'Your Moesif Application Id',
  
    debug: false,
  
    identifyUser: function (req, res) {
      if (req.user) {
        return req.user.id;
      }
      if (req.headers['my-user-id']) {
        return req.headers['my-user-id'];
      }
      return undefined;
    },
  
    identifyCompany: function (req, res) {
      if (req.headers['my-company-id']) {
  
        return req.headers['my-company-id'];
      }
      return undefined;
    },
  
    getSessionToken: function (req, res) {
      return req.headers['Authorization'];
    },
  
    getMetadata: function (req, res) {
      return {
        foo: 'express',
        bar: 'example'
      }
    },
  
    disableBatching: true,
  
    logBody: true,

    callback: function (error, data) {
      console.log('inside call back');
      console.log('error: ' + JSON.stringify(error));
    }
  };


// Creates an ExpressJS compatible Feathers application
const app = express(feathers());

var moesifMiddleware = moesifExpress(moesifOptions);

app.use(moesifMiddleware);
moesifMiddleware.startCaptureOutgoing();

app.get('/', function (req, res) {
    res.json({ message: 'first json api'});
});

app.get('/outgoing/posts', function(req, res) {
    console.log('outgoing is called');
    superagent.get('https://jsonplaceholder.typicode.com/todos/2').then(function (response) {
      console.log('back from outoging');
      console.log(response.body);
      res.json({ fromTypicode: response.body });
    }).catch(function(err) {
      res.status(500).json(err);
    });
  });

app.post('/users(/:userId)', function(req, res) {
// updateUser can be called anywhere in the node
// this is just an example it can be easily triggered by the
// test script.

// Only userId is required.
// Campaign object is optional, but useful if you want to track ROI of acquisition channels
// See https://www.moesif.com/docs/api#users for campaign schema
// metadata can be any custom object
var user = {
    userId: req.params.userId,
    companyId: '67890', // If set, associate user with a company object
    campaign: {
    utmSource: 'google',
    utmMedium: 'cpc', 
    utmCampaign: 'adwords',
    utmTerm: 'api+tooling',
    utmContent: 'landing'
    },
    metadata: {
    email: 'john@acmeinc.com',
    firstName: 'John',
    lastName: 'Doe',
    title: 'Software Engineer',
    salesInfo: {
        stage: 'Customer',
        lifetimeValue: 24000,
        accountOwner: 'mary@contoso.com'
    }
    }
};

moesifMiddleware.updateUser(user, function(err) {
    if (err) {
    console.log('update user error');
    console.log(err);
    res.status(500).end();
    }
    res.status(201).json({ user_updated: true });
});
});
  
app.post('/companies(/:companyId)', function(req, res) {

// Only companyId is required.
// Campaign object is optional, but useful if you want to track ROI of acquisition channels
// See https://www.moesif.com/docs/api#update-a-company for campaign schema
// metadata can be any custom object
var company = {
    companyId: req.params.companyId,
    companyDomain: 'acmeinc.com', // If domain is set, Moesif will enrich your profiles with publicly available info 
    campaign: { 
    utmSource: 'google',
    utmMedium: 'cpc', 
    utmCampaign: 'adwords',
    utmTerm: 'api+tooling',
    utmContent: 'landing'
    },
    metadata: {
    orgName: 'Acme, Inc',
    planName: 'Free Plan',
    dealStage: 'Lead',
    mrr: 24000,
    demographics: {
        alexaRanking: 500000,
        employeeCount: 47
    }
    }
};

moesifMiddleware.updateCompany(company, function(err) {
    if (err) {
    console.log('update company error');
    console.log(err);
    res.status(500).end();
    }
    res.status(201).json({ company_updated: true });
});
});

// Parse HTTP JSON bodies
app.use(express.json());
// Parse URL-encoded params
app.use(express.urlencoded({ extended: true }));
// Host static files from the current folder
app.use(express.static(__dirname));
// Add REST API support
app.configure(express.rest());
// Configure Socket.io real-time APIs
app.configure(socketio());

// Register a nicer error handler than the default Express one
app.use(express.errorHandler());

// Add any new real-time connection to the `everybody` channel
app.on('connection', connection =>
  app.channel('everybody').join(connection)
);
// Publish all events to the `everybody` channel
app.publish(data => app.channel('everybody'));

// Start the server
app.listen(3030).on('listening', () =>
  console.log('Feathers server listening on localhost:3030')
);

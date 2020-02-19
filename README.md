# Moesif FeathersJS Example

[FeathersJS](https://docs.feathersjs.com/) is very popular web framework for node.js.

[Moesif](https://www.moesif.com) is an API analytics platform.
[moesif-express](https://github.com/Moesif/moesif-express)
is a middleware that makes integration with Moesif easy for Express or even Node based web apps.

This example is an featherjs application with Moesif's API analytics and monitoring integrated.


## How to run this example.

1. Install all dependencies: 

```bash
npm install
```

2. Add your Moesif Application Id to the `app.js`

Your Moesif Application Id can be found in the [_Moesif Portal_](https://www.moesif.com/).
After signing up for a Moesif account, your Moesif Application Id will be displayed during the onboarding steps. 

You can always find your Moesif Application Id at any time by logging 
into the [_Moesif Portal_](https://www.moesif.com/), click on the top right menu,
and then clicking _Installation_.

```javascript
var moesifOptions = {
  applicationId: 'Your Moesif Application Id',
}
```

6. Run the example, it will listen on port 3030.

```bash
node app.js
```

7. Send some requests to some of the routes and verify that the API calls are captured in your Moesif account. 

```bash
curl http://localhost:3030
```

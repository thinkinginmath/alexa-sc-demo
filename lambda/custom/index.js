/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Evergreen Telecom Service Center, what can I do for you?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Service Request', speechText)
      .getResponse();
  },
};

const HelloWorldIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ServiceAppointment';
  },
  handle(handlerInput) {
    const speechText = 'Hello World!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
  },
  handle(handlerInput) {
    const speechText = 'You can say hello to me!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};


function httpGet(data, callback) {
  const http = require('http');
  const options = {
    host: '13.52.107.109',
    path: 'api/send_email',
    port: 9999,
    method: 'GET'
  };
  var req = http.request(options, function(res) {
    var responseString = "";

    res.on("data", function (data) {
        responseString += data;
        // save all the data from response
    });
    res.on("end", function () {
        console.log(" FROM REST API", responseString); 
        callback(responseString);
        // print to console when response ends
    });
  });

  req.write(data);
  req.end();
}
function httpPost(data, callback) {
  const http = require('http');
  const options = {
    host: '13.52.107.109',
    path: 'api/appts',
    port: 9999,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length
    }
  };
  var req = http.request(options, function(res) {
    var responseString = "";

    res.on("data", function (data) {
        responseString += data;
        // save all the data from response
    });
    res.on("end", function () {
        console.log(" FROM REST API", responseString); 
        callback(responseString);
        // print to console when response ends
    });
  });

  req.write(data);
  req.end();
}

const ChooseServiceTimeHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'ScheduleService';
  },

  async handle(handlerInput) {
    const speechText = 'Your service is confirmed to ';
    const request = handlerInput.requestEnvelope.request;
    

    if (request.dialogState === 'IN_PROGRESS') {
      if (!date.value || !timeOfService.value) {
         return handlerInput.responseBuilder
           .addDelegateDirective(request.intent)
           .getResponse();
      }
    } else if (request.dialogState === 'COMPLETED') {
      var timeOfService = request.intent.slots.serviceTime;
      var date = request.intent.slots.serviceDay;
      
      var dateString = new Date(date.value).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
      var timeString = timeOfService.value;
      console.log("request params", dateString, timeString);
      let outputText = '';
      var rp = require('request-promise');

      var options = {
        uri: 'http://nms1.uubright.com/api/appts',
        method: 'POST',
        json : true,
        body : {
          date: dateString.replace(/,/g, ''),
          start_time: timeString
        }
      };
  
      await rp(options).then(function(res) {
        outputText = res;
      }).catch(function (err) {
        // API call fail
        console.log(err);
        outputText = "Request to our scheduling server failed. " + err;
      });
      return handlerInput.responseBuilder
        .speak(outputText)
        .withSimpleCard('Your appointment is set', outputText)
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak('There are some internal errors on the server')
      .withSimpleCard('Your appointment request failed', "failed")
      .getResponse(); 
  }   
}


const NetworkStatusIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'NetworkStatus';
  },
  handle(handlerInput) {
    const speechText = 'Network is normal. There are 10 alerts at warning level';
    httpGet("", function(res) {
      console.log(res);
    });
    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Network Status', speechText)
      .getResponse();
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!';

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Hello World', speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);

    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    return handlerInput.responseBuilder
      .speak('Sorry, I can\'t understand the command. Please say again.')
      .reprompt('Sorry, I can\'t understand the command. Please say again.')
      .getResponse();
  },
};

const skillBuilder = Alexa.SkillBuilders.custom();

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    HelloWorldIntentHandler,
    HelpIntentHandler,
    NetworkStatusIntentHandler,
    ChooseServiceTimeHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Greater China Telecom Service Center, what can I do for you?';

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
    host: 'nms1.uubright.com',
    path: 'api/send_email',
    port: 80,
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

function supportsDisplay(handlerInput) {
  var hasDisplay =
      handlerInput.requestEnvelope.context &&
      handlerInput.requestEnvelope.context.System &&
      handlerInput.requestEnvelope.context.System.device &&
      handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
      handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;
    console.log("Supported Interfaces are" + JSON.stringify(handlerInput.requestEnvelope.context.System.device.supportedInterfaces));
    
    console.log("Eval output ---->" + hasDisplay);
    return true;
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
      var outputTitle = "Your apporintment request finished";
      var dateString = new Date(date.value).toLocaleDateString("en-US", { month: 'long', day: 'numeric', year: 'numeric' });
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
        outputTitle = "Your apporintment request failed";
        outputText = "Request to our backend scheduling server failed. " + err;
      });
      return handlerInput.responseBuilder
        .speak(outputText)
        .withSimpleCard(outputTitle, outputText)
        .getResponse();
    }

    return handlerInput.responseBuilder
      .speak('There are some internal errors on the server')
      .withSimpleCard('Your appointment request failed', "failed")
      .getResponse(); 
  }   
};


const NetworkStatusIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'NetworkStatus';
  },
  handle(handlerInput) {
    const responseBuilder = handlerInput.responseBuilder;
    var speechText = 'Network overall status is normal. ';
    httpGet("", function(res) {
      console.log(res);
    });


    responseBuilder.withStandardCard(
      "Network Status",
      speechText,
      "https://m.media-amazon.com/images/G/01/mobile-apps/dex/logos/alexaLogo2x._V516058141_.png",
      "https://www.huawei.com/Assets/corp/v2/img/huawei_logo.png"
    );
    if (supportsDisplay(handlerInput)) {
      const image = new Alexa.ImageHelper()
        .addImageInstance("http://cdn.tweakgeekit.com.au/content/uploads/2014/01/network-status.png")
        .getImage();
      const bgImage = new Alexa.ImageHelper()
        .addImageInstance("http://www.mattcfox.com/wp-content/uploads/2017/12/huawei-logo.jpg")
        .getImage();
      const title = "Greater China Telecom";
      
      const primaryText = new Alexa.RichTextContentHelper()
        .withPrimaryText("Network Status is Normal", '<br/>')
        .getTextContent();
      responseBuilder.addRenderTemplateDirective({
        type: "BodyTemplate2",
        backButton: 'hidden',
        //backgroundImage: bgImage,
        image,
        title,
        textContent: primaryText,
      });
      speechText = 'Network is Normal. An email summary report is also sent';
    }
    return responseBuilder
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

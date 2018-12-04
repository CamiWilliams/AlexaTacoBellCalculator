/* eslint-disable  func-names */
/* eslint-disable  no-console */

const Alexa = require('ask-sdk-core');

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the Taco Bell Calculator! You can ask what you can buy from taco bell for a dollar amount. How much money do you have?';

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Taco Bell Calculator', speechText)
      .addDirective({
        type: "Alexa.Presentation.APL.RenderDocument",
        document: require("./launchrequest.json"),
        datasources: {}
      })
      .getResponse();
  },
};

const CalculateIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'CalculateIntent';
  },
  handle(handlerInput) {
    const dollarAmount = handlerInput.requestEnvelope.request.intent.slots.dollars.value;
    console.log("WOW");
    const data = calculateOptions.call(this, dollarAmount);
    console.log("HELLO");

    let speechText = "You have " + dollarAmount + " dollars. Here is what you can buy. Either ";

    let firstSetOfOptions = data.tacoBellCalculatorData.properties.itemsCanBuy[0];
    let secondSetOfOptions = data.tacoBellCalculatorData.properties.itemsCanBuy[1];

    let index = 0;
    while (index < firstSetOfOptions.length) {
      speechText += firstSetOfOptions[index].howMany
          + " "
          + firstSetOfOptions[index].name
          + "s, ";
      index++;
    }

    speechText += " or ";
    index = 0;
    while (index < secondSetOfOptions.length) {
      speechText += secondSetOfOptions[index].howMany
          + " "
          + secondSetOfOptions[index].name
          + "s, ";
      index++;
    }

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Taco Bell Calculator', speechText)
      .addDirective({
        type: "Alexa.Presentation.APL.RenderDocument",
        document: require("./results.json"),
        datasources: data
      })
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
    CalculateIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();

function calculateOptions(dollarAmount) {
  const dollars = parseInt(dollarAmount);

  let results = [
    [],
    []
  ];

  // Fill the first options
  let index = 0;
  while (index < 8) {
    var rand = Math.floor(Math.random() * MENU_ITEMS.length);
    if (index < 4 && !results[0].includes(MENU_ITEMS[rand])) {
      results[0].push(MENU_ITEMS[rand])
      index++;
    } else if (index >= 4 && !results[1].includes(MENU_ITEMS[rand])){
      results[1].push(MENU_ITEMS[rand])
      index++;
    } else {
      continue;
    }
  }

  let quantitiesOne = recursiveFUN.call(this, dollars, results[0][0].price, 0, results[0][1].price, 0, results[0][2].price, 0, results[0][3].price, 0)
  let quantitiesTwo = recursiveFUN.call(this, dollars, results[1][0].price, 0, results[1][1].price, 0, results[1][2].price, 0, results[1][3].price, 0)

  results[0][0].howMany = quantitiesOne.item1Quantity;
  results[0][1].howMany = quantitiesOne.item2Quantity;
  results[0][2].howMany = quantitiesOne.item3Quantity;
  results[0][3].howMany = quantitiesOne.item4Quantity;

  results[1][0].howMany = quantitiesTwo.item1Quantity;
  results[1][1].howMany = quantitiesTwo.item2Quantity;
  results[1][2].howMany = quantitiesTwo.item3Quantity;
  results[1][3].howMany = quantitiesTwo.item4Quantity;

  let resultData = {
    "tacoBellCalculatorData": {
        "type": "object",
        "properties": {
          "dollars": "",
          "itemsCanBuy": []
        }
    }
  };
  resultData.tacoBellCalculatorData.properties.dollars = "$" + dollars;
  resultData.tacoBellCalculatorData.properties.itemsCanBuy = results;

  return resultData; 
}

function recursiveFUN(leftoverTotal, item1Price, item1Quantity, item2Price, item2Quantity, item3Price, item3Quantity, item4Price, item4Quantity) {
  if (leftoverTotal > item1Price) {
    leftoverTotal -= item1Price;
    item1Quantity++;
  }

  if (leftoverTotal > item2Price) {
    leftoverTotal -= item2Price;
    item2Quantity++;
  }

  if (leftoverTotal > item3Price) {
    leftoverTotal -= item3Price;
    item3Quantity++;
  }

  if (leftoverTotal > item4Price) {
    leftoverTotal -= item4Price;
    item4Quantity++;
  }

  if (leftoverTotal < item1Price
    && leftoverTotal < item2Price
    && leftoverTotal < item3Price
    && leftoverTotal < item1Price) {
    return {
      "item1Quantity" : item1Quantity,
      "item2Quantity" : item2Quantity,
      "item3Quantity" : item3Quantity,
      "item4Quantity" : item4Quantity,
      "leftoverTotal" : leftoverTotal
    }
  } else {
    return recursiveFUN.call(this, leftoverTotal, item1Price, item1Quantity, item2Price, item2Quantity, item3Price, item3Quantity, item4Price, item4Quantity);
  }
}

const MENU_ITEMS = [
  {
    "name": "Baja Blast Freeze",
    "src": "https://s3.amazonaws.com/apl-community-code/tacobell/baja_blast_freeze.jpg",
    "price": 2.29
  },
  {
    "name": "Bacon Club Chalupa",
    "src": "https://s3.amazonaws.com/apl-community-code/tacobell/bacon_club_chalupa.jpg",
    "price": 3.19
  },
  {
    "name": "Cheesy Bean and Rice Burrito",
    "src": "https://s3.amazonaws.com/apl-community-code/tacobell/cheesy_bean_and_rice_burrito.jpg",
    "price": 1.00
  },
  {
    "name": "Crunchy Taco",
    "src": "https://s3.amazonaws.com/apl-community-code/tacobell/crunchy_taco.jpg",
    "price": 1.19
  },
  {
    "name": "Caramel Apple Empanada",
    "src": "https://s3.amazonaws.com/apl-community-code/tacobell/carmel_apple_empanada.jpg",
    "price": 1.00
  },
  {
    "name": "Cool Ranch Doritos Locos Tacos",
    "src": "https://s3.amazonaws.com/apl-community-code/tacobell/cool_ranch_doritos_locos_tacos.jpg",
    "price": 1.49
  },
  {
    "name": "Fiesta Taco Salad with Beef",
    "src": "https://s3.amazonaws.com/apl-community-code/tacobell/fiesta_taco_salad_beef.jpg",
    "price": 4.99
  },
  {
    "name": "Gordita Supreme with Beef",
    "src": "https://s3.amazonaws.com/apl-community-code/tacobell/godita_supreme_beef.jpg",
    "price": 2.49
  }
];

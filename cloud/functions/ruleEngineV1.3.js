Parse.Cloud.define("ruleEngineV1.3", function (request, response) {
    console.log('Inside ruleEngine');

    // Request parameters for testing
    var username = request.params.username;
    var latestMeasurement = request.params.measurement;
    var uom = request.params.uom;
    var type = request.params.type;

    // loadUsername(deviceId).then(
    //     function success(username) {
    //         console.log('username: ' + username);

    saveMeasurement(username, type, latestMeasurement, uom).then(
        function success(measurement) {

            //Load the rules
            var ruleQuery = new Parse.Query("RuleTable");
            ruleQuery.equalTo("username", username);
            //Might need to change to find?
            ruleQuery.find({
                success: function (allRules) {

                    var promises = [];
                    allRules.forEach(function (rulesAr) {
                        promises.push(ruleLoop(rulesAr, username, type));
                    });
                    Parse.Promise.when(promises);
                },
                error: function (err) {
                    console.error(err);
                }
            });
        },
        function error(err) {
            console.error(err);
        }
    );
    //     },
    //     function error(err) {
    //         console.error(err);
    //     }
    // );
    console.log('Done with ruleEngine');
});

/********************************************* FUNCTIONS START HERE *********************************************/

function ruleLoop(rulesAr, username, type) {
    var rules = rulesAr.get("ruleArray");
    var keys = rulesAr.get("keys");
    rules.sort(comparePriority);

    console.log("Total rules: " + rules.length);
    var promises = [];
    rules.forEach(function (rule) {
        promises.push(processRule(username, type, rule, keys));
    });

    Parse.Promise.when(promises);
}

// Sort by rule priority
function comparePriority(a, b) {
    if (a.Priority < b.Priority)
        return -1;
    else if (a.Priority > b.Priority)
        return 1;
    else
        return 0;
}

function saveMeasurement(username, type, latestMeasurement, uom) {

    console.log("Saving measurement " + latestMeasurement + "" + uom);

    var promise = new Parse.Promise();

    var ParseMeasurement = Parse.Object.extend("CareRecipientMeasurement");
    var newMeasurement = new ParseMeasurement();

    newMeasurement.set("username", username);
    newMeasurement.set("type", type);

    var readings = [];

    for(var i = 0 ; i < latestMeasurement.length ; i++){
        readings.push({"uom" : uom, "reading" : latestMeasurement[i]});
    }

    newMeasurement.set("readings", readings);
    //TODO - may need to pass in the measured date
    newMeasurement.set("measuredDate", new Date());
    newMeasurement.set("starred", false);
    newMeasurement.set("triggered", false);

    promise.resolve(newMeasurement.save());

    console.log("Done Saving measurement");

    return promise;
}

function loadUsername(deviceId) {
    var promise = new Parse.Promise();

    var usernameQuery = new Parse.Query("DeviceUsername");
    usernameQuery.equalTo("deviceId", deviceId);
    usernameQuery.first({
        success: function (obj) {
            var username = obj.get("username");
            promise.resolve(username);
        },
        error: function (err) {
            promise.reject(err);
        }
    });

    return promise;
}

function loadMeasurement(username, type, start, end) {
    var promise = new Parse.Promise();

    if (type == 0) {
        var measurementValues = [[], []];
    } else
        var measurementValues = [];

    var measurementQuery = new Parse.Query("CareRecipientMeasurement");
    measurementQuery.equalTo("username", username);
    measurementQuery.equalTo("type", type);
    //TODO
    measurementQuery.greaterThanOrEqualTo("measuredDate", start);
    measurementQuery.lessThanOrEqualTo("measuredDate", end)
    measurementQuery.include("readings");
    measurementQuery.find({
        success: function (allMeasurements) {

            for (var i = 0; i < allMeasurements.length; i++) {
                var readings = allMeasurements[i].get("readings");
                if (type == 0) {
                    for (j = 0; j < readings.length; j++) {
                        measurementValues[0][i] = readings[0].reading;
                        measurementValues[1][i] = readings[1].reading;
                    }
                } else {

                    for (var j = 0; j < readings.length; j++) {
                        var reading = readings[j].reading;
                        measurementValues.push(parseFloat(reading));
                    }
                }
            }

            promise.resolve(measurementValues);

        }, error: function (err) {
            promise.reject(err);
        }
    });

    return promise;
}

//TODO - Need to pass in the messages too
function trigger(comparisonType, triggerValue, CriticalValue, result, messages, keys, type) {

    console.log("Triggering");
    var CRecipient = keys.CRecipient;
    var baseline = keys.Baseline;
    var CriticalEnabled = keys.CriticalEnabled;
    //var success = true;
    //switch the comparison type
    switch (comparisonType) {
        case ">":
            var triggered = false;

            /*********************** DOING COMPARISON BASED ON BP **********************/

            if (type == 0) {
                if (CriticalEnabled == true) {
                    console.log(CriticalValue);
                    if (result[0] > CriticalValue[0] && result[1] > CriticalValue[1]) {
                        console.log("You've hit both crits");
                        triggered = true;
                        triggeredNotif(messages, CRecipient, baseline);

                    } else if (result[0] > CriticalValue[0]) {
                        console.log("You've hit that crit");
                        triggered = true;
                        triggeredNotif(messages, CRecipient, baseline);

                    } else if (result[1] > CriticalValue[1]) {
                        console.log("You've hit that crit");
                        triggered = true;
                        triggeredNotif(messages, CRecipient, baseline);
                    }
                } else if (result[0] > triggerValue[0] && result[1] > triggerValue[1]) {
                    console.log("You've hit 2 thresholds");
                    triggered = true;

                } else if (result[0] > triggerValue[0]) {
                    console.log(result[0], " > ", triggerValue[0]);
                    triggered = true;

                    triggeredNotif(messages, CRecipient, baseline);

                } else if (result[1] > triggerValue[1]) {
                    console.log(result[1], " > ", triggerValue[1]);
                    triggered = true;

                    triggeredNotif(messages, CRecipient, baseline)

                }

                noTriggeredNotif(messages, CRecipient, baseline, triggered);
                break;
            }

            /********************** END OF BP COMPARISON *****************************/

            if (result > triggerValue) {
                console.log(result + " > " + triggerValue);
                triggered = true;

                triggeredNotif(messages, CRecipient, baseline);
            }

            noTriggeredNotif(messages, CRecipient, baseline, triggered);

            break;

        case "<":
            if (result < triggerValue) {
                console.log(result + " < " + triggerValue);
                triggered = true;

                triggeredNotif(messages, CRecipient, baseline);
            }

            noTriggeredNotif(messages, CRecipient, baseline, triggered);
            break;

        case ">=":
            if (result >= triggerValue) {
                console.log(result + " >= " + triggerValue);
                triggered = true;

                triggeredNotif(messages, CRecipient, baseline);
            }

            noTriggeredNotif(messages, CRecipient, baseline, triggered);
            break;

        case "<=":
            if (result <= triggerValue) {
                console.log(result + " <= " + triggerValue);
                triggered = true;

                triggeredNotif(messages, CRecipient, baseline);
            }

            noTriggeredNotif(messages, CRecipient, baseline, triggered);
            break;

        case "==":
            if (result == triggerValue) {
                console.log(result + " == " + triggerValue);
                triggered = true;

                triggeredNotif(messages, CRecipient, baseline);
            }

            noTriggeredNotif(messages, CRecipient, baseline, triggered);
            break;

        case "!=":
            if (result != triggerValue) {
                console.log(result + " != " + triggerValue);
                triggered = true;

                triggeredNotif(messages, CRecipient, baseline);
            }

            noTriggeredNotif(messages, CRecipient, baseline, triggered);
            break;
        default:
            //success = false;
            break;
    }

    //return success;
}

function triggeredNotif(messages, CRecipient, baseline) {
    messages.forEach(function (message) {
        var mode = message.mode;
        var finalMessage = message.message;

        if (mode != null) {
            if (mode == 0 || mode == 2) {
                finalMessage = finalMessage.replace('<<CRecipient>>', CRecipient);
                finalMessage = finalMessage.replace("<<Baseline>>", baseline);
                finalMessage = finalMessage.replace("<<Time>>", new Date().toString);
                console.log(finalMessage);
            }
        } else if (mode == null) {
            finalMessage = finalMessage.replace('<<CRecipient>>', CRecipient);
            finalMessage = finalMessage.replace("<<Baseline>>", baseline);
            finalMessage = finalMessage.replace("<<Time>>", new Date().toString);
            console.log(finalMessage);
        }
    });
}

function noTriggeredNotif(messages, CRecipient, baseline, triggered) {
    messages.forEach(function (message) {
        var mode = message.mode;
        var finalMessage = message.message;

        if (mode != null) {
            if (mode == 2) {
                finalMessage = finalMessage.replace('<<CRecipient>>', CRecipient);
                finalMessage = finalMessage.replace("<<Baseline>>", baseline);
                finalMessage = finalMessage.replace("<<Time>>", new Date().toString);
                console.log(finalMessage);
            }
        } else if (mode == null && triggered == false) {
            finalMessage = finalMessage.replace('<<CRecipient>>', CRecipient);
            finalMessage = finalMessage.replace("<<Baseline>>", baseline);
            finalMessage = finalMessage.replace("<<Time>>", new Date().toString);
            console.log(finalMessage);
        }
    });
}

function processRule(username, type, rule, keys) {
    var promise = new Parse.Promise();

    console.log("Processing rule: " + rule.Name);


    //Change the comparisonType to an enum if needed
    var comparisonType = rule.ComparisonType;
    //Change the func to an enum if needed
    var func = rule.Function;
    var start = rule.Start;
    var end = rule.End;
    var triggerValue = rule.TriggerValue;
    var messages = [];
    var CriticalValue = null;

    if (keys.CriticalEnabled == true) {
        CriticalValue = rule.CriticalValue;
    }

    for (var i = 0; i < rule.Messages.length; i++) {
        messages.push(rule.Messages[i]);
    }

    console.log(messages);

    var baseline = 0;
    if (keys.Baseline != "") {
        baseline = keys.Baseline;
    }

    var startDate;
    var endDate;
    if (end == "today()") {
        endDate = new Date();
    } else {
        endDate = new Date(end);
    }

    if (Number.isInteger(start) == false) {
        startDate = new Date(endDate - start);
        console.log("Start is not Integer");
    } else
        startDate = new Date(start);
    console.log("Start is Integer");

    loadMeasurement(username, type, startDate, endDate).then(
        function success(measurements) {

            //switch the function here
            var math = require('mathjs');

            if (type == 0) {
                console.log(measurements);
                var result = [[], []];
            } else {
                var result = 0;
                var latestMeasurement = measurements[measurements.length - 1];
            }

            if (measurements.length > 0) {
                switch (func) {
                    case "average":
                        {
                            if (type == 0) {

                                var part0 = measurements[0];
                                var part1 = measurements[1];

                                result[0][0] = math.mean(part0);
                                result[1][0] = math.mean(part1);

                                console.log(result);

                            } else
                                result = math.mean(measurements);
                        }
                        break;
                    case "count":
                        {
                            if (type == 0) {

                                result[0][0] = measurements[0].length;
                                result[1][0] = measurements[1].length;

                            } else
                                result = measurements.length;
                        }
                        break;
                    case "sum":
                        {
                            if (type == 0) {

                                var part0 = measurements[0];
                                var part1 = measurements[1];

                                result[0][0] = math.sum(part0);
                                result[1][0] = math.sum(part1);

                                console.log("The results in sum are:" + result);

                            } else
                                result = math.sum(measurements);
                        }
                        break;
                    case "difference":
                        {
                            var first = measurements[0];
                            var last = latestMeasurement;

                            if (first > last) {
                                result = math.subtract(first, last);
                            } else
                                result = math.subtract(last, first);
                        }
                        break;
                    case "differenceBaseline":
                        {
                            if (latestMeasurement > baseline) {
                                result = math.subtract(latestMeasurement, baseline);
                            } else
                                result = math.subtract(baseline, latestMeasurement);
                        }
                        break;
                    default:
                        result = latestMeasurement;
                        break;
                }
            }

            return Parse.Promise.as(result);
        },
        function error(err) {
            console.error(err);
        }
    ).then(
        function success(result) {
            console.log("Result: " + result);
            trigger(comparisonType, triggerValue, CriticalValue, result, messages, keys, type);
            promise.resolve(true);
        },
        function error(err) {
            console.error(err);
        }
        );

    return promise;
}
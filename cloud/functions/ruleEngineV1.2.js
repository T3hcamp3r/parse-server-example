Parse.Cloud.define("ruleEngineV1.2", function (request, response) {
    console.log('Inside ruleEngine');

    var math = require('mathjs');

    // Request parameters for testing
    var deviceId = request.params.deviceId;
    var latestMeasurement = request.params.measurement;
    var uom = request.params.uom;
    var type = request.params.type;

    loadUsername(deviceId).then(
        function success(username) {
            console.log('Username linked to deviceId: ' + username);

            saveMeasurement(username, type, latestMeasurement, uom).then(
                function success(measurement) {

                    //Load the rules
                    var ruleQuery = new Parse.Query("RuleTable");
                    ruleQuery.equalTo("deviceId", deviceId);
                    //Might need to change to find?
                    ruleQuery.first({
                        success: function (allRules) {
                            console.log("Rules retrieved");
                            var rules = allRules.get("ruleArray");
                            var keys = allRules.get("key");
                            rules.sort(comparePriority);
                            console.log("Rules Sorted");

                            for (var index = 0; index < rules.length; index++) {
                                var rule = rules[index];

                                console.log("In rule loop")
                                //Change the comparisonType to an enum if needed
                                var comparisonType = rule.ComparisonType;
                                //Change the func to an enum if needed
                                var func = rule.Function;
                                var start = rule.Start;
                                var end = rule.End;
                                var triggerValue = rule.TriggerValue;
                                var baseline;
                                var message;
                                console.log(comparisonType, func, start, end, triggerValue);

                                if (end == "today()") {
                                    endDate = new Date();
                                } else {
                                    endDate = new Date(end);
                                }

                                if (keys.Baseline != "") {
                                    baseline = keys.Baseline;
                                }

                                if(keys.Message != ""){
                                    message = keys.Message;
                                }

                                loadMeasurement(username, type, start, endDate).then(
                                    function success(measurements) {
                                        console.log("Measurements successfully loaded.");
                                        //switch the function here
                                        var result = 0;
                                        if (measurements.length > 0) {
                                            switch (func) {
                                                case "average":
                                                    {
                                                        result = math.sum(measurements);
                                                        result = math.divide(result, measurements.length);
                                                    }
                                                    break;
                                                case "count":
                                                    {
                                                        result = measurements.length;
                                                    }
                                                    break;
                                                case "sum":
                                                    {
                                                        result = math.sum(measurements);
                                                    }
                                                    break;
                                                case "differenceBaseline":
                                                    {
                                                        var latest = measurements[measurements.length-1];

                                                        result = latest - baseline;
                                                    }
                                                    break;
                                                case "difference":
                                                    {
                                                        var first = measurements[0];
                                                        var last = measurements[measurements.length - 1];

                                                        result = first - last;
                                                    }
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
                                        trigger(comparisonType, triggerValue, result, message);
                                    },
                                    function error(err) {
                                        console.error(err);
                                    }
                                    );
                            }
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
        },
        function error(err) {
            console.error(err);
        }
    );
});


/******************** FUNCTIONS START HERE ********************/

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
    readings.push({ "uom": uom, "reading": latestMeasurement });
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
    var measurementValues = [];
    console.log("End Date: " + end);
    var measurementQuery = new Parse.Query("CareRecipientMeasurement");
    measurementQuery.equalTo("username", username);
    measurementQuery.equalTo("type", type);
    //TODO
    measurementQuery.greaterThanOrEqualTo("measuredDate", new Date("01-mar-2017"));
    measurementQuery.lessThanOrEqualTo("measuredDate", end)
    measurementQuery.include("readings");
    measurementQuery.include("readings.uom");
    measurementQuery.include("readings.reading");
    measurementQuery.find({
        success: function (allMeasurements) {

            for (var i = 0; i < allMeasurements.length; i++) {
                var readings = allMeasurements[i].get("readings");

                for (var j = 0; j < readings.length; j++) {
                    var reading = readings[j].reading;
                    measurementValues.push(parseFloat(reading));
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
function trigger(comparisonType, triggerValue, result, message) {
    var careRecipientName = "John the Wanker";
    message.replace("<<CareRecipient>>", careRecipientName);
    message.repalce("<<TriggerValue>>", triggerValue);
    message.replace("<<result>>", result);
    console.log(message);

    //switch the comparison type
    switch (comparisonType) {
        case ">":
            if (result > triggerValue) {
                console.log(result + " > " + triggerValue);
                console.log(message);
            }
            break;

        case "<":
            if (result < triggerValue) {
                console.log(result + " < " + triggerValue);
            }
            break;

        case ">=":
            if (result >= triggerValue) {
                console.log(result + " >= " + triggerValue);
            }
            break;

        case "<=":
            if (result <= triggerValue) {
                console.log(result + " <= " + triggerValue);
            }
            break;

        case "==":
            if (result == triggerValue) {
                console.log(result + " == " + triggerValue);
            }
            break;

        case "!=":
            if (result != triggerValue) {
                console.log(result + " != " + triggerValue);
            }
            break;
    }
}
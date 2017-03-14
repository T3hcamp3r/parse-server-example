Parse.Cloud.define("ruleEngine", function (request, response) {
    // Required functions
    var diffBaselineClass = require("./functions/differenceBaseline");
    
    // Request parameters for testing
    var deviceId = request.params.deviceId;
    var measurement = request.params.measurement;
    var type = request.params.type;
    var endDate = request.params.endDate;

    // // // -- START of latest measurement retrieval -- // // //

    // Real situation will be after a save, so I get first result to compare with baseline

    // First get username related to deviceId
    var username;
    usernameQuery = new Parse.Query("DeviceUsername");
    usernameQuery.equalTo("deviceId", deviceId);
    usernameQuery.first({
        success: function (obj) {
            username = obj.get("username");
            console.log("Username retrieved is : " + username);
        },
        error: function (err) {
            response.error("Error in getting username: " + err);
        }
    })

    // Afterwhich get the latest measurement
    var measurementObj;
    measurementQuery = new Parse.Query("CareRecipientMeasurement");
    measurementQuery.equalTo("username", username);
    measurementQuery.include("readings");
    measurementQuery.include("readings.uom");
    measurementQuery.include("readings.reading");
    measurementQuery.first({
        success: function (obj) {
            measurementObj = obj;
            console.log("Measurement object retrieved : " + measurementObj);
        },
        error: function (err) {
            response.error("Error in getting latest measurements: " + err);
        }
    })

    // // // -- END of latest measurement readings retrieval -- // // //

    // Getting rule array from table
    var ruleQuery = new Parse.Query("RuleTable");
    ruleQuery.equalTo("deviceId", deviceId);
    ruleQuery.include("ruleArray");
    ruleQuery.include("ruleArray.Priority");
    ruleQuery.include("ruleArray.TriggerValue");
    ruleQuery.include("ruleArray.ComparisonType");
    ruleQuery.include("ruleArray.function");
    ruleQuery.include("ruleArray.start");
    ruleQuery.include("programmeStatus");

    // Execute Query
    ruleQuery.first({
        success: function (rules) {
            // Order all found rules by Priority
            var ruleArray = rules.get("ruleArray");
            ruleArray.sort(comparePriority);

            // Go through all rules
            for (var i = 0; i < ruleArray.length; i++) {
                var func = ruleArray[i].function;
                var ComparisonType = ruleArray[i].ComparisonType;
                var result = 0;

                // Based on rule's function, perform that function
                switch (func) {
                    case "default":
                        break;

                    case "average":
                        break;

                    case "count":
                        break;

                    case "difference":
                        break;

                    case "differenceBaseline":
                        result = diffBaselineClass.differenceBaselineFn();
                        break;

                    case "sum":
                        break;
                }

            }
        },
        error: function (err) {
            response.error("Rule Query Error: " + err);
        }
    });
});

// Sort by rule priority
function comparePriority(a, b) {
    if (a.Priority < b.Priority)
        return -1;
    else if (a.Priority > b.Priority)
        return 1;
    else
        return 0;
}
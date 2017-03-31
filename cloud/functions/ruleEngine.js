Parse.Cloud.define("ruleEngine", function (request, response) {
    // Required functions
    var diffBaselineClass = require("./differenceBaseline");
    var sumClass = require("./sum");
    var countClass = require("./count");
    var diffClass = require("./difference");
    var averageClass = require("./average")

    // Request parameters for testing
    var deviceId = request.params.deviceId;
    var measurement = request.params.measurement;
    var type = request.params.type;
    var endDate = new Date(request.params.endDate);

    // First get username related to deviceId
    var username;
    usernameQuery = new Parse.Query("DeviceUsername");
    usernameQuery.equalTo("deviceId", deviceId);
    usernameQuery.first({
        success: function (obj) {
            username = obj.get("username");

            // Afterwhich get the latest measurement
            measurementQuery = new Parse.Query("CareRecipientMeasurement");
            measurementQuery.equalTo("username", username);
            measurementQuery.include("type");
            measurementQuery.include("readings");
            measurementQuery.include("readings.uom");
            measurementQuery.include("readings.reading");
            measurementQuery.first({
                success: function (obj) {
                    var readings = obj.get("readings");
                    var reading = readings[0].reading;
                    var type = obj.get("type");
                    console.log("Measurement object retrieved : " + reading);

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
                            console.log("ruleQuery Successful");
                            var ruleArray = rules.get("ruleArray");
                            ruleArray.sort(comparePriority);
                            console.log("ruleArray sorted");

                            // Go through all rules
                            //for (var i = 0; i < ruleArray.length; i++) {
                                ruleArray.forEach(function(rule){
                                // Variables of rules required
                                var func = rule.function;
                                var ComparisonType = rule.ComparisonType;
                                var TriggerValue = rule.TriggerValue;
                                console.log("Comparison type, TriggerValue: " + ComparisonType + ", " + TriggerValue);
                                var result = 0;
                                var startDate = new Date();
                                startDate.setDate(startDate.getDate() - rule.start);
                                var functionPromise = new Parse.Promise();

                                console.log("Start Date is: " + startDate.toISOString());
                                console.log("Variables initialized");

                                // Based on rule's function, perform that function
                                switch (func) {
                                    case "", "default":
                                        break;

                                    case "average":
                                        console.log("Switch successful");
                                        averageClass.averageFn(username, type, startDate, endDate).then(function success(data){
                                            result = data;
                                        },
                                        function error(err){
                                            console.log(err);
                                        })
                                        break;

                                    case "count":
                                        result = countClass.countFn(username, type, startDate, endDate).then(function success(data){
                                            result = data;
                                        },
                                        function error(err){
                                            response.error("Error in getting count: " + count);
                                        });
                                        break;

                                    case "difference":
                                        result = diffClass.diffFn(username, type, startDate, endDate).then(function success(data){
                                            result = data;
                                        },
                                        function error(err){
                                            response.error("Error in getting difference: " + err);
                                        });
                                        break;

                                    case "differenceBaseline":
                                        result = diffBaselineClass.differenceBaselineFn(username, type, endDate, baseline).then(function success(data){
                                            result = data;
                                        },
                                        function error(err){
                                            response.error("Error in getting differenceBaseline: " + err);
                                        });
                                        break;

                                    case "sum":
                                        result = sumClass.sumFn(username, type, startDate, endDate).then(function success(data){
                                            result = data;
                                        },
                                        function error(err){
                                            response.error("Error in getting sum: " + err)
                                        });
                                        break;
                                }

                                // Based on rule's ComparisonType, perform comparison
                                switch (ComparisonType) {
                                    case ">":
                                        if (result > TriggerValue) {
                                            console.log("Greater than");
                                        }else
                                            console.log("Not triggered");
                                        break;

                                    case "<":
                                        if (result < TriggerValue) {

                                        }
                                        break;

                                    case ">=":
                                        if (result >= TriggerValue) {

                                        }
                                        break;

                                    case "<=":
                                        if (result <= TriggerValue) {

                                        }
                                        break;

                                    case "==":
                                        if (result == TriggerValue) {

                                        }
                                        break;

                                    case "!=":
                                        if (result != TriggerValue) {

                                        }
                                        break;
                                }

                            });
                        },
                        error: function (err) {
                            response.error("Rule Query Error: " + err);
                        }
                    });
                },
                error: function (err) {
                    response.error("Error in getting latest measurements: " + err);
                }
            });

        },
        error: function (err) {
            response.error("Error in getting username: " + err);
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
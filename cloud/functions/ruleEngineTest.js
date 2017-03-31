Parse.Cloud.define("ruleEngineTest", function (request, response) {
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

    var username;
    var usernameQuery = new Parse.Query("DeviceUsername");
    usernameQuery.equalTo("deviceId", deviceId);

    usernameQuery.first({
        success: function (obj) {
            username = obj.get("username");
        }
    }).then(function () {

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

        return ruleQuery.find();
    }).then(function (rules) {
        var promises = [];
        rules.forEach(function (rules) {
            console.log("ruleQuery Successful");
            var ruleArray = rules.get("ruleArray");
            ruleArray.sort(comparePriority);
            console.log("ruleArray sorted");

            ruleArray.forEach(function (rule) {
                console.log("Rule loop in.");
                // Variables of rules required
                var func = rule.function;
                var ComparisonType = rule.ComparisonType;
                var TriggerValue = rule.TriggerValue;
                var promise;
                var startDate = new Date();
                startDate.setDate(startDate.getDate() - rule.start);
                console.log("Comparison type, TriggerValue: " + ComparisonType + ", " + TriggerValue);

                if (func == "") {

                } else if (func == "average") {
                    promise = Parse.Promise.as(averageClass.averageFn(username, type, startDate, endDate));
                    promises.push(promise);
                } else if (func == "sum") {
                    console.log("Inside sum else if.");
                    promise = Parse.Promise.as(sumClass.sumFn(username, type, startDate, endDate));
                    promises.push(promise);
                } else if (func == "difference") {

                }

            });
        });
        console.log(JSON.stringify(promises));
        return Parse.Promise.when(promises);

    }).then(function (result) {
        result.then(function () {
            console.log("Anything la idk");
            console.log(JSON.stringify(result));
        })
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
exports.averageFn = function (username, type, start, end) {
    var query = new Parse.Query("CareRecipientMeasurement");
    var promise = new Parse.Promise();

    console.log("Username received:" + username);
    console.log("Type received:" + type);
    console.log("Start received:" + start.toISOString());
    console.log("End received:" + end.toISOString());
    query.equalTo("username", username);
    query.equalTo("type", type);
    query.greaterThanOrEqualTo("measuredDate", start);
    query.lessThanOrEqualTo("measuredDate", end)
    query.include("readings");
    query.include("readings.uom");
    query.include("readings.reading");

    query.find({
        success: function (obj) {
            var averageValue = 0;
            var counter = 0;
            var readings = obj[0].get("readings");
            var reading = readings[0].reading;
            console.log("Reading: " + reading);
            for (var i = 0; i < obj.length; i++) {
                var readings = obj[i].get("readings");
                for (var j = 0; j < readings.length; j++) {
                    // Previously taken in as a string
                    averageValue += parseFloat(readings[j].reading).toFixed(2);
                    counter++;
                }
            }
            averageValue /= counter;
            console.log("Average calculation success: " + averageValue);
            promise.resolve(averageValue);
        }, error: function (err) {
            response.error("Error getting average: " + err);
            promise.reject(err);
        }
    });
    return promise;
}



exports.differenceBaselineFn = function (username, type, end, baseline) {
    var query = new Parse.Query("CareRecipientMeasurement");

    query.equalTo("username", username);
    query.equalTo("type", type);
    query.equalTo("measuredDate", end);
    query.include("readings");
    query.include("readings.reading");
    query.first({
        success: function (obj) {
            // Get readings
            var readings = obj.get("readings");
            var reading = parseFloat(readings[0].reading).toFixed(2);
            // Added correlation for clarity, postive or negative difference
            var correlation = "";
            if (reading > baseline) {
                var difference = reading - baseline;
                correlation = "+"
            } else {
                var difference = baseline - reading;
                correlation = "-"
            }
            response.success("Differencebaseline of Object in cloud code: " + obj + " reading difference is: " + correlation + difference);
            promise.resolve(difference);
        },
        error: function (err) {
            response.error("difference inside 1 fail: " + err);
            promise.reject(err);
        }
    });
}
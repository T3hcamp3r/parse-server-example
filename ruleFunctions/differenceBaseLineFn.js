exports.differenceBaselineFunction = function (start, baseline, username, type) {
    //var measurements = request.object.get('objectId');
    var promise = new Parse.Promise();
    var query = new Parse.Query("CareRecipientMeasurement");
    query.equalTo("username", username);
    query.equalTo("type", type);
    query.equalTo("measuredDate", start);
    query.include("readings");
    query.include("readings.uom");
    query.include("readings.reading");
    query.first({
        success: function (obj) {
            if (obj.reading[0].reading > baseline) {
                var difference = obj.readings[0].reading - baseline;
            } else {
                var difference = baseline - obj.readings[0].reading;
            }
            response.success("Differencebaseline of Object in cloud code: " + obj + " reading difference is: " + difference);
            promise.resolve(difference);
        },
        error: function (err) {
            response.error("difference inside 1 fail: " + err);
            promise.reject(err);
        }
    });
    return promise;
}

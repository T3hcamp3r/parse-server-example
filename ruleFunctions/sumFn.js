exports.sumFunction = function (start, end, username, type) {
    //var measurements = request.object.get('objectId');
    var promise = new Parse.Promise();
    var query = new Parse.Query("CareRecipientMeasurement");
    query.equalTo("username", username);
    query.equalTo("type", type);
    query.greaterThanOrEqualTo("measuredDate", start);
    query.lessThanOrEqualTo("measuredDate", end);
    query.include("readings");
    query.include("readings.uom");
    query.include("readings.reading");
    query.find({
        success: function (obj) {
            var sum = 0;
            for(var i = 0; i < obj.length; i++){
                for(var j = 0; j < obj.reading.length; j++){
                    sum += obj.readings[j].reading;
                }
            }
            response.success("sum of Object in cloud code: " + obj + " sum is: " + sum);
            promise.resolve(sum);
        },
        error: function (err) {
            response.error("sum fail: " + err);
            promise.reject(err);
        }
    });
    return promise;
}

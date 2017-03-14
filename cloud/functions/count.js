exports.countFn = function (username, type, start, end) {
    var query = new Parse.Query("CareRecipientMeasurement");
    var promise = new Parse.Promise();

    query.greaterThanOrEqualTo("measuredDate", start);
    query.lessThanOrEqualTo("measuredDate", end);
    query.equalTo("username", username);
    query.equalTo("type", type);
    query.count({
        success: function (obj) {
            response.success("Number of Object in cloud code: " + obj);
            promise.resolve(obj);
        },
        error: function (err) {
            response.error("Counter fail: " + err);
            promise.reject(err);
        }
    });
})
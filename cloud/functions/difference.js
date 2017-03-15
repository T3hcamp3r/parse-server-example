exports.differenceFn = function (username, type, first, second) {
    var query = new Parse.Query("CareRecipientMeasurement");
    var promise = new Parse.Promise();

    query.equalTo("username", username);
    query.equalTo("type", type);
    query.equalTo("measuredDate", first);
    query.include("readings");
    query.include("readings.uom");
    query.include("readings.reading");
    query.first({
        success: function (obj) {
            var query2 = new Parse.Query("CareRecipientMeasurement");
            // Since using query.first, obj.get is used instead of obj[0].get
            var readings1 = obj.get("readings");
            // Ensuring that integers are passed
            var value1 = parseFloat(readings1[0].reading).toFixed(2);
            query2.equalTo("username", username);
            query2.equalTo("type", type);
            query2.equalTo("measuredDate", second);
            query2.include("readings");
            query2.include("readings.uom");
            query2.include("readings.reading");
            query2.first({
                success: function (obj2) {
                    // Since using query.first, obj.get is used instead of obj[0].get
                    var readings2 = obj2.get("readings");
                    // Ensuring that integers are passed
                    var value2 = parseFloat(readings2[0].reading).toFixed(2);
                    if (value1 > value2) {
                        var difference = value1 - value2;
                    } else {
                        var difference = value2 - value1;
                    }
                    response.success("Difference of Object in cloud code: " + obj + " reading difference is: " + difference);
                    promise.resolve(difference);
                },
                error: function (err2) {
                    response.error("difference inside 2 fail: " + err2);
                    promise.reject(err2);
                }
            });
        },
        error: function (err) {
            response.error("difference inside 1 fail: " + err);
            promise.reject(err);
        }
    });

}
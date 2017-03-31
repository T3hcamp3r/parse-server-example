exports.averageFn = function (username, type, start, end) {
    var query = new Parse.Query("CareRecipientMeasurement");
    var promise = Parse.Promise.as();

    console.log("Username received:" + username);
    console.log("Type received:" + type);
    console.log("Start received:" + start.toISOString());
    console.log("End received:" + end.toISOString());
    query.equalTo("username", username);
    query.equalTo("type", type);
    query.greaterThanOrEqualTo("measuredDate", start);
    query.lessThanOrEqualTo("measuredDate", end);
    query.include("readings");
    query.include("readings.uom");
    query.include("readings.reading");

    var counter = 0;
    var average = 0;
    return promise = (query.find().then(function (obj) {
        var subPromise = new Parse.Promise();
        obj.forEach(function (obj) {
            var readings = obj.get("readings");
            readings.forEach(function (readings) {
                average += parseFloat(readings.reading);
                counter++;
            });
        });
        average /= counter;
        console.log("Average calculated: " + average);
        subPromise.resolve(average);
        console.log("Average calculated2: " + average);
        return subPromise;
    }));
}

    // query.find({
    //     success: function (obj) {
    //         console.log("jjjjjj" + obj);
    //         //var measurement = [];
    //         var averageValue = 0;
    //         var counter = 0;
    //         for (var i = 0; i < obj.length; i++) {
    //             var readings = obj[i].get("readings");
    //             for (var j = 0; j < readings.length; j++) {
    //                 averageValue += parseFloat(readings[j].reading);
    //                 counter++;
    //             }
    //         }
    //         averageValue /= counter;
    //         response.success("Average Object in cloud code: " + obj + " average value: " + averageValue);
    //         promise.resolve(averageValue);
    //     },
    //     error: function (err) {
    //         response.error("Error getting Average: " + err);
    //         promise.reject(err);
    //     }
    // });

    // return promise;
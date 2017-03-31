exports.sumFn = function (username, type, start, end) {
    var query = new Parse.Query("CareRecipientMeasurement");
    var promise = new Parse.Promise();

    query.equalTo("username", username);
    query.equalTo("type", type);
    query.greaterThanOrEqualTo("measuredDate", start);
    query.lessThanOrEqualTo("measuredDate", end)
    query.include("readings");
    query.include("readings.reading");

    var sum = 0;

    return promise = query.find().then(function(obj){
        var subPromise = new Parse.Promise();
        obj.forEach(function(obj){
            var readings = obj.get("readings");
            readings.forEach(function(reading){
                sum += parseFloat(reading.reading);
            });
        });
        console.log("Sum inside sum function " + sum);
        subPromise.resolve(sum);
        return subPromise;
    });
}



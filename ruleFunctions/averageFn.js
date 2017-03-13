exports.averageFunction = function (start, end, username, type) {
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
      //var measurement = [];
      var averageValue = 0;
      var counter = 0;
      for (var o = 0; i < obj.length; i++) {
        var readings = obj[i].get("readings");
        for (var j = 0; j < readings.length; j++) {
          averageValue += readings[j].reading;
          counter++;
        }
      }
      averageValue /= counter;
      response.success("Average Object in cloud code: " + obj + " average value: " + averageValue);
      promise.resolve(averageValue);
    },
    error: function (err) {
      response.error("Error getting Average: " + err);
      promise.reject(err);
    }
  });
  return promise;
}



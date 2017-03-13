exports.differenceFunction = function (start, end, username, type) {
  //var measurements = request.object.get('objectId');
  var promise = new Parse.Promise();
  var query = new Parse.Query("CareRecipientMeasurement");
  query.equalTo("username", username);
  query.equalTo("type", type);
  query.equalTo("measuredDate", end);
  query.include("readings");
  query.include("readings.uom");
  query.include("readings.reading");
  query.first({
    success: function (obj) {
      var query2 = new Parse.Query("Measurement");
      query2.equalTo("username", username);
      query2.equalTo("username", type);
      query2.equalTo("measuredDate", end);
      query2.include("readings");
      query2.include("readings.uom");
      query2.include("readings.reading");
      query2.first({
        success: function (obj2) {
          if (obj.reading[0].reading > obj2.reading[0].reading) {
            var difference = obj.readings[0].reading - obj2.readings[0].reading;
          } else {
            var difference = obj2.readings[0].reading - obj.readings[0].reading;
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
  return promise;
}

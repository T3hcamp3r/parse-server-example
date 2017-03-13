exports.countFunction = function (start, end, username, type) {
  //var measurements = request.object.get('objectId');
  var promise = new Parse.Promise();
  var query = new Parse.Query("CareRecipientMeasurement");
  query.equalTo("username", username);
  query.equalTo("type", type);
  query.greaterThanOrEqualTo("measuredDate", start);
  query.lessThanOrEqualTo("measuredDate", end);
  query.count({
    success: function (obj) {
      response.success("Number of Object in cloud code: " + obj);
      promise.resolve(object);
    },
    error: function (err) {
      response.error("Counter fail: " + err);
      promise.reject(err);
    }
  });
  return promise;
}

exports.sumFn = function(username, type, start, end) {
    var query = new Parse.Query("CareRecipientMeasurement");

    query.equalTo("username", username);
    query.equalTo("type", type);
    query.greaterThanOrEqualTo("measuredDate", start);
    query.lessThanOrEqualTo("measuredDate", end)
    query.include("readings");
    query.include("readings.reading");

    query.find({
        success: function(obj){
            var sum = 0;
            for(var i = 0; i < obj.length; i++){
                // Unable to retrieve obj.readings.length
                var readings = obj[i].get("readings");
                for(var j = 0 ; j < readings.length ; j++){
                    sum += parseFloat(readings[j].reading).toFixed(2);
                }
            }
            response.success("Sum object in cloud code: " + obj + " average value : " + sum )
        }, error : function(err){
            response.error("Error getting average: " + err);
        }
    });
});



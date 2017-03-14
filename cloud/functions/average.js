exports.averageFn = function(username, type, start, end){
    var query = new Parse.Query("CareRecipientMeasurement");

    query.equalTo("username", username);
    query.equalTo("type", type);
    query.greaterThanOrEqualTo("measuredDate", start);
    query.lessThanOrEqualTo("measuredDate", end)
    query.include("readings");
    query.include("readings.uom");
    query.include("readings.reading");

    query.find({
        success: function(obj){
            var averageValue = 0;
            var counter = 0;
            // i was o before
            for(var i = 0; i < obj.length; i++){
                var readings = obj[i].get("readings");
                for(var j = 0 ; j < readings.length ; j++){
                    // Previously taken in as a string
                    averageValue += parseFloat(readings[j].reading).toFixed(2);
                    counter++;
                }
            }
            averageValue /= counter;
            response.success("Average object in cloud code: " + obj + " average value : " + averageValue )
        }, error : function(err){
            response.error("Error getting average: " + err);
        }
    });
});



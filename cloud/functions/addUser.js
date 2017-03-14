Parse.Cloud.define('addUser', function(req, res){
    var username = req.params.username;
    var type = req.params.type;
    var readings = req.params.readings;
    var measuredDate = req.params.measuredDate;
    var CareRecipientMeasurement = Parse.Object.extend("CareRecipientMeasurement");
    var obj = new CareRecipientMeasurement();

    obj.set("username", username);
    obj.set("type", type);
    obj.set("readings", readings);
    obj.set("measuredDate", measuredDate);

    obj.save().then(function success(){
        res.success("Succesfully saved.");
    },function error(err){
        res.error(err);
    })
});
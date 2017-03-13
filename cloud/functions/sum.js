Parse.Cloud.beforeSave("CareRecipientMeasurement", function (request, response) {
    var sumClass = require('../../ruleFunctions/sumFn');

    var start = new Date();
    start.setDate(7);
    start.setMonth(3);
    start.setFullYear(2017);

    var obj = request.Object;
    var end = obj.get("measuredDate");


    sumClass.sumFunction(start, end, request.params.username, request.params.type).then(
        function success(data) {
            res.success("Success sum " + JSON.stringify(data));
        },
        function error(err) {
            res.error("Error: " + JSON.stringify(err));
        });
});
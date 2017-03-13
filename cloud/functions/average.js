Parse.Cloud.beforeSave("CareRecipientMeasurement", function (request, response) {
    var averageClass = require('../../ruleFunctions/averageFn');
    averageClass.averageFunction(request.params.start, request.params.end, request.params.username, request.params.type).then(
        function success(data) {
            res.success("Success average " + JSON.stringify(data));
        },
        function error(err) {
            res.error("Error: " + JSON.stringify(err));
        });
});

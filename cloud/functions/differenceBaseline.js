Parse.Cloud.beforeSave("CareRecipientMeasurement", function (request, response) {
    var differenceBaselineClass = require('../../ruleFunctions/differenceBaslineFn');
    differenceBaselineClass.differenceBaselineFunction(request.params.start, request.params.baseline, request.params.username, request.params.type).then(
        function success(data) {
            res.success("Success differencebaseline " + JSON.stringify(data));
        },
        function error(err) {
            res.error("Error: " + JSON.stringify(err));
        });
});

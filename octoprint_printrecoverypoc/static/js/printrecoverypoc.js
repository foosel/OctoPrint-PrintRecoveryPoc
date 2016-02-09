$(function() {
    function PrintRecoveryViewModel(parameters) {
        var self = this;

        self.loginState = parameters[0];
        self.settings = parameters[1];
        self.printerState = parameters[2];

        self.recoveryAvailable = ko.observable(false);
        self.recoveryOrigin = ko.observable();
        self.recoveryPath = ko.observable();
        self.recoveryDate = ko.observable();
        self.recoveryPos = ko.observable();
        self.recoveryPrescript = ko.observable();

        self.dialog = undefined;

        self.canRecover = ko.pureComputed(function() {
            return self.recoveryAvailable() && self.loginState.isUser() && self.printerState.isReady() &&
                (self.printerState.filename() == undefined || self.printerState.filename() == self.recoveryPath());
        });

        self.dateString = ko.pureComputed(function() {
            return formatDate(self.recoveryDate());
        });

        self.posString = ko.pureComputed(function() {
            return formatSize(self.recoveryPos());
        });

        self.requestData = function() {
            $.ajax({
                url: API_BASEURL + "plugin/printrecoverypoc",
                type: "GET",
                dataType: "json",
                success: function(data) {
                    self.fromResponse(data);
                }
            });
        };

        self.fromResponse = function(response) {
            self.recoveryAvailable(response.available);
            if (response.available) {
                self.recoveryOrigin(response.origin);
                self.recoveryPath(response.path);
                self.recoveryDate(response.date);
                self.recoveryPos(response.pos);
                self.recoveryPrescript(response.prescript.join("\n"));
            } else {
                self.recoveryOrigin(undefined);
                self.recoveryPath(undefined);
                self.recoveryDate(undefined);
                self.recoveryPos(undefined);
                self.recoveryPrescript(undefined);
            }
        };

        self.showDialog = function() {
            self.dialog.modal("show");
        };

        self.recover = function() {
            var payload = {
                command: "recover",
                prescript: splitTextToArray(self.recoveryPrescript(), "\n", true)
            };

            $.ajax({
                url: API_BASEURL + "plugin/printrecoverypoc",
                type: "POST",
                dataType: "json",
                data: JSON.stringify(payload),
                contentType: "application/json; charset=UTF-8",
                success: function() {
                    self.dialog.modal("hide");
                }
            });
        };

        self.onStartup = function() {
            self.dialog = $("#printrecoverypoc_confirmation_dialog");
            self.requestData();
        };

        self.onDataUpdaterReconnect = function() {
            self.requestData();
        };

        self.onEventPrintStarted = function() {
            self.requestData();
        };

        self.onEventPrintDone = function() {
            self.requestData();
        };

        self.onEventPrintFailed = function() {
            self.requestData();
        };
    }

    // view model class, parameters for constructor, container to bind to
    ADDITIONAL_VIEWMODELS.push([
        PrintRecoveryViewModel,
        ["loginStateViewModel", "settingsViewModel", "printerStateViewModel"],
        ["#sidebar_plugin_printrecoverypoc_wrapper", "#printrecoverypoc_confirmation_dialog"]
    ]);
});

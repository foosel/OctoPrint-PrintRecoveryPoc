# coding=utf-8

import octoprint.plugin

class PrintRecoveryPlugin(octoprint.plugin.TemplatePlugin,
                          octoprint.plugin.AssetPlugin,
                          octoprint.plugin.SimpleApiPlugin,
                          octoprint.plugin.SettingsPlugin):

	#~~ SettingsPlugins

	def get_settings_defaults(self):
		return dict(prescript=["T0        ; select first extruder",
		                       ";M140 S80 ; set bed temperature",
		                       "M109 S215 ; set and wait for extruder temperature",
		                       ";M190 S80 ; set and wait for bed temperature"])

	#~~ TemplatePlugin

	def get_template_configs(self):
		return [
			dict(type="sidebar", template="printrecoverypoc_sidebar.jinja2", data_bind="visible: canRecover", icon="warning-sign", styles_wrapper=["display: none"])
		]

	#~~ AssetPlugin

	def get_assets(self):
		return dict(
			js=["js/printrecoverypoc.js"],
			css=["css/printrecoverypoc.css"]
		)

	#~~ SimpleApiPlugin

	def get_api_commands(self):
		return dict(recover=["prescript"])

	def on_api_get(self, request):
		from flask import jsonify
		from octoprint.filemanager import FileDestinations

		data = self._get_recovery_data()
		if data is not None:
			origin = data["origin"]
			if origin == FileDestinations.LOCAL:
				return jsonify(available=True,
				               path=data["path"],
				               pos=data["pos"],
				               date=data["date"],
				               prescript=self._settings.get(["prescript"]))

		return jsonify(available=False)

	def on_api_command(self, command, data):
		if command != "recover":
			return

		if not self._printer.is_ready():
			return

		recovery_data = self._get_recovery_data()
		if recovery_data is None:
			return

		from octoprint.filemanager import FileDestinations

		path = recovery_data["path"]
		sd = recovery_data["origin"] == FileDestinations.SDCARD

		prescript = data["prescript"]
		if isinstance(prescript, basestring):
			prescript = map(lambda x: x.strip(), prescript.split("\n"))

		self._printer.commands(prescript)

		full_path = self._file_manager.path_on_disk(recovery_data["origin"], path)
		self._printer.select_file(full_path, sd, printAfterSelect=True, pos=recovery_data["pos"])

	#~~ Internal helpers

	def _get_recovery_data(self):
		return self._file_manager.get_recovery_data()

__plugin_name__ = "Print Recovery POC"
__plugin_implementation__ = PrintRecoveryPlugin()

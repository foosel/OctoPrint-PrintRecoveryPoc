----

**WARNING:** This is only a Proof of Concept. It might break things. It might cause horrible accidents. It could
eat your dog. Do only use if you are prepared to fiddle around with code a bit. It is only shared to show
how a plugin might realize a print recovery using the new print recovery data funcationlity in the file manager.
It is not a production ready plugin. **No Support!**

----

# OctoPrint-PrintRecoveryPoc

Proof of concept of how a print recovery plugin might be realised.

Should not be used in production environments, this is really just a proof of concept to get others started.

If print recovery data is found, displays an entry in the sidebar about that. Attempting recovery via the
corresponding button opens a confirmation dialog that allowed further specifying a small GCODE script to run
before continuing the print, e.g. to heat up what ever needs heating up and selecting the correct extruder.

Recovery then basically means executing the prescript and then continuing the print exactly at the position
it was aborted in.

More intelligent approaches would involve parsing the GCODE file up until the aborted position in order to

  * extract temperatures and other setup instructions,
  * find the last layer change before the abort and move the print head there,
  * figure out the active extruder,
  * set the correct feedrate,
  * maybe even move the print head not only to the correct Z but also X and Y coordinates before
    continuing.

Note that there will always be a discrepancy between what OctoPrint last sent to the printer and what the printer
last executed, at least in case of disconnects or similar issues. OctoPrint doesn't know what commands it
sent to the printer were already executed and what weren't (thanks to an internal buffer on the printer side
about which no information at all is availble).

## Setup

Install via the bundled [Plugin Manager](https://github.com/foosel/OctoPrint/wiki/Plugin:-Plugin-Manager)
or manually using this URL:

    https://github.com/foosel/OctoPrint-PrintRecoveryPoc/archive/master.zip

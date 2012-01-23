EXT_DIR=/usr/share/gnome-shell/extensions/rbindicator@comandrei.gmail.com/
SCHEMA=org.gnome.shell.extensions.rbindicator.gschema.xml
SCHEMA_DIR=/usr/share/glib-2.0/schemas/
uninstall:
	rm -rf $(EXT_DIR)
	rm $(SCHEMA_DIR)$(SCHEMA)
	glib-compile-schemas $(SCHEMA_DIR)
install:
	mkdir -p $(EXT_DIR)
	cp src/* $(EXT_DIR)
	cp $(SCHEMA) $(SCHEMA_DIR)
	cp icons/rb.png /usr/share/icons/gnome/16x16/apps/rb.png
	cp icons/rb-mod.png /usr/share/icons/gnome/16x16/apps/rb-mod.png
	gtk-update-icon-cache -f /usr/share/icons/gnome/



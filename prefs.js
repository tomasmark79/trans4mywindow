import Adw from 'gi://Adw';
import Gtk from 'gi://Gtk';

import {
  ExtensionPreferences,
  gettext as _,
} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class TransparentWindowsPreferences extends ExtensionPreferences {
  fillPreferencesWindow(window) {
    const page = new Adw.PreferencesPage();
    const group = new Adw.PreferencesGroup({
      title: _(''),
      description: _(''),
    });
    group.add(this.buildPrefsWidget());
    page.add(group);
    window.add(page);
  }

  buildPrefsWidget() {
    const settings = this.getSettings();
    const box = new Gtk.Box({
      halign: Gtk.Align.CENTER,
      orientation: Gtk.Orientation.VERTICAL,
      'margin-top': 20,
      'margin-bottom': 20,
      'margin-start': 20,
      'margin-end': 20,
      spacing: 22,
    });

    // Add opacity slider (5% to 100%)
    box.append(
      this.buildOpacitySlider(
        settings,
        'active-window-opacity',
        [5, 100, 1, 5],
        _('Active window opacity percentage:')
      )
    );
    // Add opacity slider (5% to 100%)
    box.append(
      this.buildOpacitySlider(
        settings,
        'inactive-window-opacity',
        [5, 100, 1, 5],
        _('Inactive window opacity percentage:')
      )
    );
    // Add window filter entry
    box.append(this.buildWindowFilterEntry(settings));
    // Add info text
    box.append(
      new Gtk.Label({
        label:
          'The first opening of every window is fully opaque, it is the default behavior of the extension, **transparency is activated when focus changes between windows.** Also, fullscreen is always fully opaque.',
        halign: Gtk.Align.START,
        hexpand: true,
        wrap: true,
        xalign: 0,
      })
    );

    return box;
  }

  buildOpacitySlider(settings, key, values, labelText) {
    const [lower, upper, step, page] = values;
    const vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 10,
    });

    const hbox = new Gtk.Box({
      orientation: Gtk.Orientation.HORIZONTAL,
      spacing: 10,
    });

    const label = new Gtk.Label({
      label: labelText,
      halign: Gtk.Align.START,
      hexpand: true,
      wrap: true,
      xalign: 0,
    });

    // Get initial value
    const initialValue = settings.get_int(key);

    const valueLabel = new Gtk.Label({
      label: `${initialValue}%`,
      halign: Gtk.Align.END,
      width_chars: 5,
    });

    hbox.append(label);
    hbox.append(valueLabel);

    const adjustment = new Gtk.Adjustment({
      lower,
      upper,
      step_increment: step,
      page_increment: page,
      value: initialValue,
    });

    const scale = new Gtk.Scale({
      orientation: Gtk.Orientation.HORIZONTAL,
      adjustment,
      digits: 0,
      hexpand: true,
      draw_value: false,
    });

    // Add tooltip for accessibility
    scale.set_tooltip_text(
      _(
        'Adjust the transparency level from 5% (very transparent) to 100% (fully opaque)'
      )
    );

    // Update settings when scale changes
    scale.connect('value-changed', () => {
      const value = Math.round(scale.get_value());
      settings.set_int(key, value);
      valueLabel.set_text(`${value}%`);
    });

    // Update scale when settings change externally
    settings.connect(`changed::${key}`, () => {
      const value = settings.get_int(key);
      scale.set_value(value);
      valueLabel.set_text(`${value}%`);
    });

    vbox.append(hbox);
    vbox.append(scale);

    return vbox;
  }

  buildWindowFilterEntry(settings) {
    const vbox = new Gtk.Box({
      orientation: Gtk.Orientation.VERTICAL,
      spacing: 6,
    });

    const label = new Gtk.Label({
      label: _('Apply only to these windows (WM class, comma-separated):'),
      halign: Gtk.Align.START,
      hexpand: true,
      wrap: true,
      xalign: 0,
    });

    const entry = new Gtk.Entry({
      text: settings.get_string('window-filter'),
      placeholder_text: _('e.g. kgx, org.gnome.Terminal'),
      hexpand: true,
    });
    entry.set_tooltip_text(
      _('Leave empty to apply transparency to all windows.')
    );

    entry.connect('changed', () => {
      settings.set_string('window-filter', entry.get_text());
    });

    settings.connect('changed::window-filter', () => {
      const val = settings.get_string('window-filter');
      if (entry.get_text() !== val) entry.set_text(val);
    });

    vbox.append(label);
    vbox.append(entry);

    return vbox;
  }
}

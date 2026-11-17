# Trans4MyWindow

Adjust the opacity of focused and inactive windows in GNOME Shell, with an
optional filter for application WM classes.

## Features

- Independent opacity controls for focused and inactive windows
- Opacity from 5% (mostly transparent) to 100% (fully opaque)
- Defaults of 88% for the focused window and 44% for inactive windows
- Optional comma-separated WM-class filter, matched case-insensitively by substring
- Immediate updates when focus or settings change
- Windows outside the filter stay fully opaque
- Disabling the extension restores windows to full opacity

## Requirements

Declared GNOME Shell versions: **46–51**, as listed in `metadata.json`.
Preferences require GTK 4 and libadwaita. The interface is English.

Build tools: Bash, Python 3, Node.js (syntax checks), zip and `glib-compile-schemas`.
Local installation also requires `gnome-extensions`.

## Installation

Download the [latest GitHub build](https://github.com/tomasmark79/trans4mywindow/releases/download/github-build/trans4mywindow%40digitalspace.name.zip).
The ZIP is built automatically from `main`. Its [release page](https://github.com/tomasmark79/trans4mywindow/releases/tag/github-build)
lists the source commit, build date, declared Shell compatibility and SHA-256 checksums.
GitHub builds are independent of the review process on GNOME Extensions.

Install the downloaded ZIP:

```bash
gnome-extensions install --force ~/Downloads/trans4mywindow@digitalspace.name.zip
```

Or build and install from the project directory:

```bash
./build.sh --install
```

Installation updates the user copy without enabling the extension or logging you
out. On Wayland, log out and back in when needed to load new or changed JavaScript,
then enable:

```bash
gnome-extensions enable trans4mywindow@digitalspace.name
```

## Usage

Open Preferences:

```bash
gnome-extensions prefs trans4mywindow@digitalspace.name
```

Set **Active window opacity percentage** and **Inactive window opacity percentage**.
The extension applies these values when focus or settings change. A newly opened
window may remain opaque until the next focus change.

Leave the window filter empty to apply opacity to all windows, or enter WM-class
substrings separated by commas, such as `kgx, org.gnome.Terminal`. Windows that do
not match the filter stay fully opaque. A window without a WM class does not match
a nonempty filter.

## Development

```bash
./build.sh --check
./build.sh
```

The output is `dist/trans4mywindow@digitalspace.name.zip`. `-b` and `-r` are build
aliases; `-i`, `-bi` and `-ri` build the current sources and install them.
The script never enables the extension or logs out the session.

Each push to `main` runs the same build in GitHub Actions and updates the
**Latest GitHub build** release after a successful build. The rolling `github-build`
tag follows the published commit; the version in `metadata.json` is left unchanged.
The workflow uses the built-in GitHub token and needs no additional secrets.

Compare with a separately saved distribution archive when checking an unchanged
package:

```bash
./build.sh --compare-zip /path/to/previous-trans4mywindow.zip
```

This checks every file path and its bytes, including metadata. ZIP timestamps,
entry order and compression may differ. Schemas are validated and compiled in a
temporary directory. The package preserves the existing layout without LICENSE
or a compiled schema; GNOME compiles the XML schema during installation.

The root-level `trans4mywindow@digitalspace.name.zip` is retained as the original
reference archive. Compared with that archive, the standardized package corrects
the repository URL and adds GNOME Shell 50 in `metadata.json`, and renames the schema XML file to
`schemas/org.gnome.shell.extensions.trans4mywindow.gschema.xml`. Its schema ID,
schema contents and JavaScript stay unchanged. A direct comparison with that
legacy archive therefore reports these expected differences.

For runtime changes, verify focused/inactive opacity, empty and nonempty filters,
case-insensitive matching, Preferences, multiple workspaces and monitors, newly
opened windows, and repeated disable/enable. Check that disabling restores full
opacity. Syntax validation and a successful build do not establish runtime
compatibility with every declared Shell version.

## Troubleshooting

- If a build tool is missing, install the tools listed in **Requirements**.
- If a window stays opaque, clear the WM-class filter and switch focus between windows.
- If code changes do not appear, start a fresh GNOME session and enable the extension.

Report problems with reproduction steps and your GNOME Shell version in the
[issue tracker](https://github.com/tomasmark79/trans4mywindow/issues).

## License

Copyright © 2026 Tomáš Mark. [GPL-3.0-or-later](LICENSE).

[GitHub](https://github.com/tomasmark79/trans4mywindow) · [Donate via PayPal](https://paypal.me/TomasMark)

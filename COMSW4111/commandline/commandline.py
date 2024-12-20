#!/usr/bin/env python3

import click
import sys
from pathlib import Path
from COMSW4111.server import create_app

file = Path(__file__).resolve()
package_root_directory = file.parents[1]
sys.path.append(str(package_root_directory))

@click.group()
def web_browser():
    """Click group for web browser related commands."""
    pass


@click.command()
def launch():
    """
    Launches the web browser and runs the app.
    :param url: The URL to open in the web browser.
    """
    app = create_app()
    app.run(host="0.0.0.0", port=8111, debug=True)

@click.command()
@click.option("--url", default="http://127.0.0.1:8111", help="Local Dev")
def local(url):
    """
    Launches the web browser and runs the app.
    :param url: The URL to open in the web browser.
    """
    app = create_app()
    click.launch(url)
    app.run(host="127.0.0.1", port=8111, debug=True)

web_browser.add_command(launch)
web_browser.add_command(local)
cli = click.CommandCollection(sources=[web_browser])

if __name__ == '__main__':
    cli()

"""Acceptance: a default_map string for a multi-value option is split like its environment variable."""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src"))

import click
from click.testing import CliRunner


@click.command()
@click.option("--pair", nargs=2, envvar="PAIR")
def cli(pair):
    click.echo(repr(pair))


def check():
    runner = CliRunner()
    from_env = runner.invoke(cli, [], env={"PAIR": "a b"})
    assert from_env.output.strip() == "('a', 'b')", from_env.output
    from_map = runner.invoke(cli, [], default_map={"pair": "a b"})
    assert from_map.exit_code == 0, from_map.output
    assert from_map.output.strip() == "('a', 'b')", from_map.output
    explicit = runner.invoke(cli, ["--pair", "x", "y"], default_map={"pair": "a b"})
    assert explicit.output.strip() == "('x', 'y')", explicit.output
    print("PASS: check_default_map")


if __name__ == "__main__":
    check()

VENV_DIR = $(CURDIR)/venv
PYTHON = python3
VENV_PYTHON = $(VENV_DIR)/bin/python
VENV_PIP = $(VENV_DIR)/bin/pip
SHELL := /bin/bash

.PHONY: venv clean develop build install requirements sync run

venv:  ## Create virtual environment
	test -d $(VENV_DIR) || $(PYTHON) -m venv $(VENV_DIR)
	. $(VENV_DIR)/bin/activate && \
	$(VENV_PIP) install --upgrade pip setuptools wheel pip-tools

install-deps: venv  ## Install core dependencies
	. $(VENV_DIR)/bin/activate && \
	$(VENV_PIP) install Flask==2.2.2 Werkzeug==2.2.2 Flask-Login==0.6.2 Flask-SQLAlchemy==3.0.2 flask-migrate==4.0.4 flask-httpauth==4.7.0 flask-wtf==1.1.1 urllib3==1.26.6 psycopg2==2.9.5

verify-flask: install-deps  ## Verify Flask installation
	. $(VENV_DIR)/bin/activate && \
	$(VENV_PYTHON) -c "import flask; print(flask.__file__)" || (echo "Flask is not installed in the virtual environment"; exit 1)

requirements: install-deps  ## Compile requirements from pyproject.toml
	. $(VENV_DIR)/bin/activate && \
	$(VENV_PIP)-compile --upgrade --strip-extras --output-file=requirements.txt pyproject.toml

sync: requirements  ## Sync virtual environment with requirements.txt
	. $(VENV_DIR)/bin/activate && \
	$(VENV_PIP)-sync requirements.txt && \
	$(VENV_PIP) install -e .

develop: clean venv install-deps sync verify-flask  ## Set up development environment

run: verify-flask  ## Run the application
	. $(VENV_DIR)/bin/activate && \
	$(VENV_PYTHON) -m COMSW4111 local

clean:  ## Clean everything
	rm -rf $(VENV_DIR)
	rm -rf .coverage coverage cover htmlcov logs build dist *.egg-info .pytest_cache
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

test: verify-flask  ## Run tests
	. $(VENV_DIR)/bin/activate && \
	$(VENV_PYTHON) -m pytest
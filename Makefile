VENV_DIR = $(CURDIR)/venv
PYTHON = $(VENV_DIR)/bin/python
PIP = $(VENV_DIR)/bin/pip

.PHONY: venv clean develop build install

venv:  ## Create virtual environment
	python3 -m venv $(VENV_DIR)
	$(PIP) install --upgrade pip setuptools wheel

develop: venv  ## Install dependencies in virtual environment
	$(PIP) uninstall -y Flask Werkzeug && \
	$(PIP) install Werkzeug==2.2.2 && \
	$(PIP) install Flask==2.2.2 && \
	$(PIP) install -e . && \
	$(PIP) install urllib3==1.26.6 \
		Flask-Login==0.6.2 \
		Flask-SQLAlchemy==3.0.2 \
		flask-migrate==4.0.4 \
		flask-httpauth==4.7.0 \
		flask-wtf==1.1.1 \
		psycopg2==2.9.5

clean:  ## Clean everything
	rm -rf $(VENV_DIR)
	rm -rf .coverage coverage cover htmlcov logs build dist *.egg-info .pytest_cache
	find . -type d -name __pycache__ -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete

run:  ## Run the application
	$(PYTHON) -m COMSW4111 local

test: ## Run tests
	$(PYTHON) -m pytest

# Add this to automatically create the venv if it doesn't exist
$(VENV_DIR):
	$(MAKE) venv
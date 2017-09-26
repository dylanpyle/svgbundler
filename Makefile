SHELL := /bin/bash

.PHONY: lint
lint:
	$$(npm bin)/tslint 'src/**/*.ts'

.PHONY: build
build:
	@echo -n 'Compiling... '
	@$$(npm bin)/tsc
	@echo 'Done'

.PHONY: run-built-tests
run-built-tests:
	@echo 'Running tests... '
	@node dist/test.js

.PHONY: test
test: build run-built-tests

.PHONY: release-min
release-minor: build
	npm version minor
	npm publish
	git push --tags

.PHONY: release-patch
release-patch: build
	npm version patch
	npm publish
	git push --tags

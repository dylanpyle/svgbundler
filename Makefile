SHELL := /bin/bash

.PHONY: lint
lint:
	$$(npm bin)/tslint 'src/**/*.ts'

.PHONY: build
build:
	$$(npm bin)/tsc

.PHONY: test
test:
	node dist/test.js

.PHONY: release-min
release-minor: build
	npm version minor

.PHONY: release-patch
release-patch: build
	npm version patch

build-and-test: build test

check: test

test:
	@NODE_ENV=test ./node_modules/.bin/mocha


clean:
	
.PHONY: test clean
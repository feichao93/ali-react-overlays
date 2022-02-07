yarn rimraf dist-temp/
yarn rimraf dist/
yarn rollup --config rollup.config.js
yarn api-extractor run --local --verbose
yarn copyfiles --up 1 dist-temp/**/*.js dist/
yarn rimraf dist-temp/
yarn copyfiles --up 2 src/styles/* dist/styles/

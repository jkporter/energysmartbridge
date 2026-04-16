set -e

echo Setting ENV Variables
export CONFIG_PATH="/data/options.json"
echo Env Set

echo Listing Versions!
nginx -v
echo "Node Version: $(node -v)"
echo "NPM Version: $(npm -v)"

nginx -g 'daemon off;' &
./app | pino-pretty
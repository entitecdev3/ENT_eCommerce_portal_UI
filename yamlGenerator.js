const fs = require('fs');

const configRaw = fs.readFileSync('./webapp/config.json');
const templateYamlRaw = fs.readFileSync('./ui.template.yaml');
const config = JSON.parse(configRaw);
const templateYamlString = templateYamlRaw.toString();

const {
	api_internal_https: protocol,
	api_internal_port: port,
	api_internal_host: host,
} = config.api;
// const protocol="http";
// const port="1883";
// const host="localhost";
// const context="http";

const replacedYamlString = templateYamlString
	.replace('${protocol}', protocol ? 'https' : 'http')
	.replace('${port}', port)
	.replace('${host}', host)
	.replace('${Appport}',config.Port)
	.replace('${Appports}',config.Port)
	.replace('${protocol}', protocol ? 'https' : 'http')
	.replace('${diapiBase}',config.diapiBase ? config.diapiBase : 'localhost')
	.replace('${AppLiveport}', " "+config.liveReload);

fs.writeFileSync('ui5.yaml', replacedYamlString);
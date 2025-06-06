const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');
const path = require('path');

module.exports = {
	packagerConfig: {
		asar: {
			unpack: '**/node_modules/better-sqlite3/**/*',
		},
		prune: true,
		compression: 'maximum',
		icon: path.resolve(__dirname, 'src/public/imgs/icon.png'),
		files: [
			'dist/**',
			'package.json',
			'!**/node_modules/*/{test,__tests__,tests,pkg,example,examples,benchmark,doc,docs}/**',
			'!**/*.md',
			'!**/*.map',
			'!**/*.ts',
			'!**/*.tsx',
			'!**/*.log',
			'!forge.config.js',
			'!webpack.*.config.js',
		],
	},
	rebuildConfig: {},
	makers: [
		{
			name: '@electron-forge/maker-squirrel',
			config: {},
		},
		{
			name: '@electron-forge/maker-zip',
			platforms: ['darwin', 'win32'],
		},
	],
	plugins: [
		{
			name: '@electron-forge/plugin-auto-unpack-natives',
			config: {},
		},
		// Fuses are used to enable/disable various Electron functionality
		// at package time, before code signing the application
		new FusesPlugin({
			version: FuseVersion.V1,
			[FuseV1Options.RunAsNode]: false,
			[FuseV1Options.EnableCookieEncryption]: true,
			[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
			[FuseV1Options.EnableNodeCliInspectArguments]: false,
			[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
			[FuseV1Options.OnlyLoadAppFromAsar]: true,
		}),
	],
};

import { create, Template } from 'template-factory';
import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import color from 'chalk';

const main = async () => {
	const { version, name } = JSON.parse(
		fs.readFileSync(new URL('../package.json', import.meta.url), 'utf-8')
	);

	const templates: Template<unknown>[] = [
		{
			name: 'SaasStarter',
			flag: 'saas-starter',
			repo: 'https://github.com/CriticalMoments/CMSaasStarter.git',
			excludeFiles: ['SECURITY.md', 'LICENSE'],
			copyCompleted: async ({ dir }) => {
				fs.rename(path.join(dir, 'local_env_template'), path.join(dir, '.env.local'));
			},
			prompts: [
				{
					kind: 'confirm',
					message: 'Install dependencies?',
					yes: {
						run: async () => {
							return [
								{
									kind: 'select',
									message: 'What package manager do you want to use?',
									options: ['npm', 'pnpm', 'yarn', 'bun'].map((pm) => ({
										name: pm,
										select: {
											run: async ({ dir }) => {
												await execa({ cwd: dir })`${pm} install`;
											},
											startMessage: `Installing dependencies with ${pm}`,
											endMessage: 'Installed dependencies',
										},
									})),
								},
							];
						},
					},
				},
			],
		},
	];

	await create({
		appName: name,
		version: version,
		templates: templates,
		customization: {
			intro: async ({ appName, version }) => {
				const name = color.bgHex('#e1a54e').black(` ${appName} `);
				const ver = color.gray(` v${version} `);
				return name + ver;
			},
			outro: async () => {
				return color.green('All done!');
			},
		},
	});
};

main();

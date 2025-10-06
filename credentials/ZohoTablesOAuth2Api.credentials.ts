import type { ICredentialType, INodeProperties } from 'n8n-workflow';

const scopes = ["ZohoTables.portals.READ", "WorkDrive.team.ALL", "ZohoTables.workspaces.READ", "WorkDrive.workspace.ALL", "WorkDrive.files.ALL", "ZohoTables.bases.READ", "ZohoTables.tables.READ", "ZohoTables.views.READ", "ZohoTables.records.READ", "ZohoTables.records.CREATE", "ZohoTables.records.DELETE", "ZohoTables.records.UPDATE", "ZohoTables.fields.READ", "ZohoTables.fields.CREATE", "ZohoTables.fields.UPDATE", "ZohoTables.fields.DELETE", "WorkDrive.files.ALL", "ZohoTables.webhooks.UPDATE"];

export class ZohoTablesOAuth2Api implements ICredentialType {
	name = 'zohotablesOAuth2Api';

	extends = ['oAuth2Api'];

	displayName = 'ZohoTables OAuth2 API';

	documentationUrl = 'https://tables.zoho.com/help/api/v1';

	properties: INodeProperties[] = [
		{
			displayName: 'Grant Type',
			name: 'grantType',
			type: 'hidden',
			default: 'authorizationCode',
		},
		{
			displayName: 'Authorization URL',
			name: 'authUrl',
			type: 'options',
			options: [
				{
					name: 'https://accounts.zoho.com/oauth/v2/auth',
					value: 'https://accounts.zoho.com/oauth/v2/auth',
					description: 'For the EU, AU, and IN domains',
				},
				{
					name: 'https://accounts.zoho.com.cn/oauth/v2/auth',
					value: 'https://accounts.zoho.com.cn/oauth/v2/auth',
					description: 'For the CN domain',
				},
			],
			default: 'https://accounts.zoho.com/oauth/v2/auth',
			required: true,
		},
		{
			displayName: 'Access Token URL',
			name: 'accessTokenUrl',
			type: 'options',
			options: [
				{
					name: 'AU - https://accounts.zoho.com.au/oauth/v2/token',
					value: 'https://accounts.zoho.com.au/oauth/v2/token',
				},
				{
					name: 'CN - https://accounts.zoho.com.cn/oauth/v2/token',
					value: 'https://accounts.zoho.com.cn/oauth/v2/token',
				},
				{
					name: 'EU - https://accounts.zoho.eu/oauth/v2/token',
					value: 'https://accounts.zoho.eu/oauth/v2/token',
				},
				{
					name: 'IN - https://accounts.zoho.in/oauth/v2/token',
					value: 'https://accounts.zoho.in/oauth/v2/token',
				},
				{
					name: 'US - https://accounts.zoho.com/oauth/v2/token',
					value: 'https://accounts.zoho.com/oauth/v2/token',
				},
			],
			default: 'https://accounts.zoho.com/oauth/v2/token',
			required: true,
		},
		{
			displayName: 'Scope',
			name: 'scope',
			type: 'hidden',
			default: `${scopes.join(' ')}`,
		},
		{
			displayName: 'Auth URI Query Parameters',
			name: 'authQueryParameters',
			type: 'hidden',
			default: 'access_type=offline',
		},
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'hidden',
			default: 'body',
		},
	];
}

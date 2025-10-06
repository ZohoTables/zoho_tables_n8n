import {type INodeTypeDescription, NodeConnectionTypes } from 'n8n-workflow';

import * as record from './record/Record.resource';

export const versionDescription: INodeTypeDescription = {
	displayName: 'Zoho Tables',
	name: 'zohotables',
	icon: 'file:zohotables.svg',
	group: ['input'],
	version: [1],
	subtitle: '',
	description: 'Read, update, write and delete data from Zoho Tables',
	defaults: {
		name: 'Zoho Tables',
	},
	inputs: [NodeConnectionTypes.Main],
	outputs: [NodeConnectionTypes.Main],
	credentials: [
		{
			name: 'zohotablesOAuth2Api',
			required: true,
			displayOptions: {
				show: {
					authentication: ['zohotablesOAuth2Api'],
				},
			},
		},
	],
	properties: [
		{
			displayName: 'Authentication',
			name: 'authentication',
			type: 'options',
			options: [
				{
					name: 'OAuth2',
					value: 'zohotablesOAuth2Api',
				},
			],
			default: 'zohotablesOAuth2Api',
		},
		{
			displayName: 'Resource',
			name: 'resource',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Record',
					value: 'record',
				},
			],
			default: 'record',
		},
		...record.description,
	],
};

import type { INodeProperties } from 'n8n-workflow';
export const portalRLC: INodeProperties = {

	displayName: 'Portal',
	name: 'portal',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: 'portalSearch',
				searchable: true,
			},
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '[a-zA-Z0-9]{2,}',
						errorMessage: 'Not a valid Zoho Tables Portal ID',
					},
				},
			],
			placeholder: 'e.g. appD3dfaeidke',
			url: '=https://tables.zoho.com/{{$value}}',
		},
	],

}

export const workspaceRLC: INodeProperties = {
	displayName: 'Workspace',
	name: 'workspace',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: 'workspaceSearch',
				searchable: true,
			},
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '[a-zA-Z0-9]{2,}',
						errorMessage: 'Not a valid Zoho Tables Workspace ID',
					},
				},
			],
			placeholder: 'e.g. appD3dfaeidke'
		}
	],
};

export const baseRLC: INodeProperties = {
	displayName: 'Base',
	name: 'base',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: 'baseSearch',
				searchable: true,
			},
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '[a-zA-Z0-9]{2,}',
						errorMessage: 'Not a valid Zoho Tables Base ID',
					},
				},
			],
			placeholder: 'e.g. appD3dfaeidke',
			url: '=https://tables.zoho.com/bas{{$value}}',
		},
	],
};

export const tableRLC: INodeProperties = {
	displayName: 'Table',
	name: 'table',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	required: true,
	typeOptions: {
		loadOptionsDependsOn: ['base.value'],
	},
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: 'tableSearch',
				searchable: true,
			},
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '[a-zA-Z0-9]{2,}',
						errorMessage: 'Not a valid Zoho Tables ID',
					},
				},
			],
			placeholder: 'tbl3dirwqeidke',
		},
	],
};

export const viewRLC: INodeProperties = {
	displayName: 'View',
	name: 'view',
	type: 'resourceLocator',
	default: { mode: 'list', value: '' },
	modes: [
		{
			displayName: 'From List',
			name: 'list',
			type: 'list',
			typeOptions: {
				searchListMethod: 'viewSearch',
				searchable: true,
			},
		},
		{
			displayName: 'ID',
			name: 'id',
			type: 'string',
			validation: [
				{
					type: 'regex',
					properties: {
						regex: '[a-zA-Z0-9]{2,}',
						errorMessage: 'Not a valid Zoho Tables View ID',
					},
				},
			],
			placeholder: 'viw3dirwqeidke',
		},
	],
};

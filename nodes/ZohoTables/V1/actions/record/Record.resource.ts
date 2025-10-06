import type { INodeProperties } from 'n8n-workflow';

import * as create from './create.operation';
import * as search from './search.operation';
import * as update from './update.operation';
import * as deleteRecord from './delete.operation';


import { portalRLC, workspaceRLC, baseRLC, tableRLC } from '../common.descriptions';

export { create, search, update, deleteRecord };

export const description: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		options: [
			{
				name: 'Create',
				value: 'create',
				description: 'Create a new record in a table',
				action: 'Create a record',
			},
			{
				name: 'Search',
				value: 'search',
				description: 'Search for specific records or list all',
				action: 'Search records',
			},
			{
				name: 'Create or Update',
				value: 'update',
				description: 'Update a record in a table',
				action: 'Update record',
			},
			{
				name: 'Delete',
				value: 'deleteRecord',
				description: 'Delete record in a table',
				action: 'Delete record',
			},
		],
		default: 'create',
		displayOptions: {
			show: {
				resource: ['record'],
			},
		},
	},
	{
		...portalRLC,
		displayOptions:{
			show:{
				resource:["record"],
			}
		}
	},
	{
		...workspaceRLC,
		displayOptions:{
			show:{
				resource:["record"],
			}
		}
	},
	{
		...baseRLC,
		displayOptions: {
			show: {
				resource: ['record'],
			},
		},
	},
	{
		...tableRLC,
		displayOptions: {
			show: {
				resource: ['record'],
			},
		},
	},
	...create.description,
	...search.description,
	...update.description,
	...deleteRecord.description,
];

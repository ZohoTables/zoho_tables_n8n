import type { INodeTypeBaseDescription, IVersionedNodeType } from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { ZohoTablesV1 } from './V1/ZohoTablesV1.node';

export class ZohoTables extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Zoho Tables',
			name: 'zohoTables',
			icon: 'file:zohotables.svg',
			group: ['input'],
			description: 'Read, update, write and delete data from Zoho Tables',
			defaultVersion: 1,
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			1: new ZohoTablesV1(baseDescription)
		};

		super(nodeVersions, baseDescription);
	}
}

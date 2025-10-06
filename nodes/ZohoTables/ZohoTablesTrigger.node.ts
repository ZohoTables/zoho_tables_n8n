import type {	
	INodeTypeBaseDescription,
	IVersionedNodeType,
} from 'n8n-workflow';
import { VersionedNodeType } from 'n8n-workflow';

import { ZohoTablesTriggerV1 } from './V1/ZohoTablesTriggerV1.node';

export class ZohoTablesTrigger extends VersionedNodeType {
	constructor() {
		const baseDescription: INodeTypeBaseDescription = {
			displayName: 'Zoho Tables Trigger',
			name: 'zohoTablesTrigger',
			icon: 'file:zohotables.svg',
			group: ['trigger'],
			description: 'Handle Zoho Tables events via webhooks (Beta)',
			defaultVersion: 1,
		};

		const nodeVersions: IVersionedNodeType['nodeVersions'] = {
			1: new ZohoTablesTriggerV1(baseDescription)
		};

		super(nodeVersions, baseDescription);
	}
}

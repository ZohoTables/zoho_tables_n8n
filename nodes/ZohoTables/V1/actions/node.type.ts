import type { AllEntities } from 'n8n-workflow';

type NodeMap = {
	record: 'create' | 'search' | 'update';
	base: 'getMany' | 'getSchema';
	table: 'create';
};

export type ZohoTablesType = AllEntities<NodeMap>;

import type { IExecuteFunctions, INodeExecutionData } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

import type { ZohoTablesType } from './node.type';
import * as record from './record/Record.resource';

export async function router(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
	let returnData: INodeExecutionData[] = [];

	const items = this.getInputData();
	const resource = this.getNodeParameter<ZohoTablesType>('resource', 0);
	const operation = this.getNodeParameter('operation', 0);

	const zohotablesNodeData = {
		resource,
		operation,
	} as ZohoTablesType;

	try {
		switch (zohotablesNodeData.resource) {
			case 'record':
				const baseID = this.getNodeParameter('base', 0, undefined, {
					extractValue: true,
				}) as string;

				const tableID = this.getNodeParameter('table', 0, undefined, {
					extractValue: true,
				}) as string;

				returnData = await record[zohotablesNodeData.operation].execute.call(
					this,
					items,
					baseID,
					tableID,
				);

				break;
			default:
				throw new NodeOperationError(
					this.getNode(),
					`The operation "${operation}" is not supported!`,
				);
		}
	} catch (error) {
		if (
			error.description &&
			(error.description as string).includes('cannot accept the provided value')
		) {
			error.description = `${error.description}. Consider using 'Typecast' option`;
		}
		throw error;
	}

	return [returnData];
}

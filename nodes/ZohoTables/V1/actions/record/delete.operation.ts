import type {
	INodeExecutionData,
	INodeProperties,
	NodeApiError,
	IExecuteFunctions,
} from 'n8n-workflow';

import { updateDisplayOptions } from 'n8n-workflow';
import { processZohoTablesError } from '../../helpers/utils';
import { apiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Record ID',
		name: 'id',
		type: 'string',
		default: '',
		placeholder: 'e.g. vooOzA',
		required: true,
		description: 'ID of the record to delete',
	},
];

const displayOptions = {
	show: {
		resource: ['record'],
		operation: ['deleteRecord'],
	},
};

export const description = updateDisplayOptions(displayOptions, properties);

export async function execute(
	this: IExecuteFunctions,
	items: INodeExecutionData[],
	baseID: string,
	tableID: string,
): Promise<INodeExecutionData[]> {

	const returnData: INodeExecutionData[] = [];
	const endpoint = 'records';

	for (let i = 0; i < items.length; i++) {
		let id;
		try {
			id = this.getNodeParameter('id', i) as string;

			const qs ={
				base_id: baseID,
				table_id: tableID,
				record_id: id
			}

			const responseData = await apiRequest.call(this, 'DELETE', endpoint, {}, qs);

			const executionData = this.helpers.constructExecutionMetaData(
				[{ json: responseData }],
				{ itemData: { item: i } },
			);

			returnData.push(...executionData);

		} catch (error) {

			error = processZohoTablesError(error as NodeApiError, id, i);
			if (this.continueOnFail()) {
				returnData.push({ json: { error: error.message } });
				continue;
			}
			throw error;
		}
	}

	return returnData;
}

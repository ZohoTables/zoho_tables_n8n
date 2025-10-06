import type {
	IDataObject,
	INodeExecutionData,
	INodeProperties,
	IExecuteFunctions,
	NodeApiError,
} from 'n8n-workflow';

import { updateDisplayOptions } from 'n8n-workflow';
import { processZohoTablesError } from '../../helpers/utils';
import { apiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Columns',
		name: 'columns',
		type: 'resourceMapper',
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		noDataExpression: true,
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ["workspace.value", "base.value", "table.value"],
			resourceMapper: {
				resourceMapperMethod: 'getFields',
				mode: 'add',
				fieldWords: {
					singular: 'column',
					plural: 'columns',
				},
				addAllFields: true,
				multiKeyMatch: true,
				supportAutoMap: false
			}
		},
	}
];

const displayOptions = {
	show: {
		resource: ['record'],
		operation: ['create'],
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
		try {

			const fields = this.getNodeParameter('columns.value', i, {}) as IDataObject;
			let qs = createQueryString(baseID, tableID, fields);

			const responseData = await apiRequest.call(this, 'POST', endpoint, {}, qs);
			const executionData = this.helpers.constructExecutionMetaData(
				[{ json: responseData }],
				{ itemData: { item: i } },
			);

			returnData.push.apply(returnData, executionData);

		} catch (error) {

			error = processZohoTablesError(error as NodeApiError, undefined, i);
			if (this.continueOnFail()) {
				returnData.push({ json: { message: error.message, error } });
				continue;
			}
			throw error;
		}
	}

	return returnData;
}

function createQueryString(baseID : string, tableID : string, fields : IDataObject){

	const fieldIDs: string[] = Object.keys(fields);
	const values = Object.values(fields).map((v) => {

		if (typeof v === 'object' && v !== null && (v as IDataObject).isLuxonDateTime === true) {
			return (v as IDataObject).ts as number; // only take timestamp
		}
		return v;

	}).filter((v): v is string | number => typeof v === 'string' || typeof v === 'number');

	const qs = {
		"base_id": baseID,
		"table_id": tableID,
		"field_ids": JSON.stringify(fieldIDs),
		"values": JSON.stringify(values)
	};

	return qs as IDataObject;

};

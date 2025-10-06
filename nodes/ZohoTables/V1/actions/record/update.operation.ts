import type {
	INodeExecutionData,
	INodeProperties,
	IExecuteFunctions,
	IDataObject,
	NodeApiError,
} from 'n8n-workflow';

import { updateDisplayOptions } from 'n8n-workflow';
import { normalizeCheckbox, processZohoTablesError, sanitizeValue } from '../../helpers/utils';
import { apiRequest } from '../../transport';

const properties: INodeProperties[] = [
	{
		displayName: 'Columns',
		name: 'columns',
		type: 'resourceMapper',
		noDataExpression: true,
		default: {
			mappingMode: 'defineBelow',
			value: null,
		},
		required: true,
		typeOptions: {
			loadOptionsDependsOn: ['table.value', 'base.value'],
			resourceMapper: {
				resourceMapperMethod: 'getFieldsWithNames',
				mode: 'update',
				fieldWords: {
					singular: 'field',
					plural: 'fields',
				},
				addAllFields: false,
				multiKeyMatch: true,
				supportAutoMap: false,
			},
		}
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add option',
		default: {},
		options: [
			{
				displayName: 'First Match Only',
				name: 'first_match_only',
				type: 'boolean',
				default: true,
				description: 'Whether to update first record that matches the value in the "Column to Match On". If not set, all the records will be updated.'
			},
			{
				displayName: 'Is Case Sensitive',
				name: 'is_case_sensitive',
				type: 'boolean',
				default: true,
				description: 'Can be set as false for case-insensitive search. Note : Field names and conditions should be case-sensitive. This case-sensitive and case-insensitive search only applicable for the values in the criteria whose field type is any of the following : Text, URL, Email, Attachment, Link and Lookup if linked using any one of previously mentioned field types.'
			},
			{
				displayName: 'Is Upsert Needed',
				name: 'is_upsert_needed',
				type: 'boolean',
				default: false,
				description: 'Can be set us true if needed. (upsert-If the criteria do not find a matching record, a new record will be created with the given data)'
			}
		],
	},
];

const displayOptions = {
	show: {
		resource: ['record'],
		operation: ['update'],
	}
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

	const columnsToMatchOn = this.getNodeParameter('columns.matchingColumns', 0) as string[];

	for (let i = 0; i < items.length; i++) {
		try {

			const fields = this.getNodeParameter( 'columns.value', i, [], undefined) as IDataObject;
			const options = this.getNodeParameter('options', i, {});

			const data: Record<string, string | number | boolean> = {};

			for (const [key, rawValue] of Object.entries(fields)) {
				let value: any = rawValue;

				if ((value as IDataObject).isLuxonDateTime === true) {
					value = (value as IDataObject).ts as number; // only take timestamp
				} else {
					value = normalizeCheckbox(value);
					value = sanitizeValue(value as any);
				}
				data[key] = value;
			}

			const criteriaParts: string[] = [];
			for (const col of columnsToMatchOn) {
				if (!(col in data)) {
					throw new Error(`Column ${col} not found in fields`);
				}
				const val = data[col];
				criteriaParts.push(`"${col}" = "${val}"`);
			}

			const criteria = criteriaParts.join(' and ');

			const qs ={
				base_id: baseID,
				table_id: tableID,
				data: JSON.stringify(data),
				criteria: criteria,
				is_upsert_needed : true,
				first_match_only: false,
				is_case_sensitive: true
			}

			if (options.is_upsert_needed != undefined) {
				qs.is_upsert_needed = options.is_upsert_needed as boolean;
			}

			if (options.first_match_only != undefined) {
				qs.first_match_only = options.first_match_only as boolean;
			}

			if (options.is_case_sensitive != undefined) {
				qs.is_case_sensitive = options.is_case_sensitive as boolean;
			}

			const responseData = await apiRequest.call(this, 'PUT', endpoint, {}, qs);
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

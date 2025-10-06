import type {
	IDataObject,
	INodeExecutionData,
	INodeProperties,
	IExecuteFunctions,
} from 'n8n-workflow'

import { updateDisplayOptions } from 'n8n-workflow';
import { flattenOutput } from '../../helpers/utils';
import { apiRequest } from '../../transport';
import { viewRLC } from '../common.descriptions';

const properties: INodeProperties[] = [
	{
		displayName: 'Criteria',
		name: 'criteria',
		type: 'string',
		default: '',
		placeholder: 'e.g. ({Name} = "Rajin") and "Amount" > "30"',
		hint: 'If empty, all the records will be returned',
		description: 'The criteria will be evaluated for each record, and if the result is not 0, false, "", NaN, [], or #Error! the record will be included in the response. <a href="https://tables.zoho.com/help/api/v1#RECORDS-Fetch-Record-with-Criteria" target="_blank">More info</a>.',
	},
	{
		displayName: 'Limit',
		name: 'count',
		type: 'number',
		typeOptions: {
			minValue: 1,
			maxValue: 1000
		},
		default: 100,
		description: 'Max number of results to return',
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		default: {},
		description: 'Additional options which decide which records should be returned',
		placeholder: 'Add option',
		options: [
			viewRLC,
			{
				displayName: 'Is Case Sensitive',
				name: 'is_case_sensitive',
				type: 'boolean',
				default: true,
				description: 'Whether the search should be case-sensitive (can be set to false for a case-insensitive search)'
			},
			{
				displayName: 'Is RecordID Used',
				name: 'is_ids_used_in_params',
				type: 'boolean',
				default: false,
				description: 'Whether Record IDs are used in the criteria. By default, this is false.'
			},
			{
				displayName: 'Is First Match Only',
				name: 'first_match_only',
				type: 'boolean',
				default: false,
				description: 'Whether to fetch only the first matched record when multiple records satisfy the criteria. If set to false, all matched records will be fetched.'
			}
		],
	}
];

const displayOptions = {
	show: {
		resource: ['record'],
		operation: ['search'],
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

	const endpoint = 'fetchRecordsWithCriteria';

	let itemsLength = items.length ? 1 : 0;

	for (let i = 0; i < itemsLength; i++) {
		try {

			const criteria = this.getNodeParameter('criteria', i) as string;
			const options = this.getNodeParameter('options', i, {});

			const qs: IDataObject = {};

			if (criteria) {
				qs.criteria = criteria;
			}

			qs.base_id = baseID;
			qs.table_id = tableID;
			qs.count = this.getNodeParameter('count', i);
			qs.is_ids_used_in_params = false;
			qs.is_case_sensitive = true;
			qs.first_match_only = false;

			if(options.is_case_sensitive != undefined){
				qs.is_case_sensitive = options.isCaseSensitive as boolean;
			}

			if(options.is_ids_used_in_params != undefined){
				qs.is_ids_used_in_params = options.is_ids_used_in_params as boolean;
			}

			if(options.first_match_only != undefined){
				qs.first_match_only = options.first_match_only as boolean;
			}

			if(options.view != undefined){
				let view = options.view as IDataObject;
				qs.view_id = view.value;
			}

			let responseData = await apiRequest.call(this, 'POST', endpoint, {}, qs);
			let records = responseData.records.fetched;

			records = (records as IDataObject[]).map((record) => ({
				json: flattenOutput(record),
			})) as INodeExecutionData[];

			const itemData = [{ item: i }];

			const executionData = this.helpers.constructExecutionMetaData(records, {
				itemData,
			});

			returnData.push(...executionData);

		} catch (error) {
			if (this.continueOnFail()) {
				returnData.push({ json: { message: error.message, error }, pairedItem: { item: i } });
				continue;
			} else {
				throw error;
			}
		}
	}
	return returnData;
}

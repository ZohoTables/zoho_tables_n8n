import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IPollFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
} from 'n8n-workflow';

import { NodeOperationError } from 'n8n-workflow';

export function throwOnErrorStatus(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions | IPollFunctions,
	responseData: {
		data?: Array<{ status: string; message: string }>;
	},
) {
	if (responseData?.data?.[0].status === 'error') {
		throw new NodeOperationError(this.getNode(), responseData as Error);
	}
}

/**
 * Make an API request to zoho tables
 *
 */

export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	uri?: string,
	option: IDataObject = {},
) {
	query = query || {};

	const options: IRequestOptions = {
		headers: {},
		method,
		body,
		qs: query,
		uri: uri || `https://tables.zoho.com/api/v1/${endpoint}`,
		useQuerystring: false,
		json: true,
	};

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	const authenticationMethod = this.getNodeParameter('authentication', 0) as string;
	return await this.helpers.requestOAuth2.call(this, authenticationMethod, options);
}

/**
 * Make an API request to paginated Zoho Tables endpoint
 * and return all results
 *
 * @param {(IExecuteFunctions | IExecuteFunctions)} this
 */
export async function apiRequestAllItems(

	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	qs: IDataObject = {},
) {

	const returnData: IDataObject[] = [];

	let responseData;
	qs.per_page = 200;
	qs.page = 1;

	do {
		responseData = await apiRequest.call(this, method, endpoint, body, qs);
		if (Array.isArray(responseData) && !responseData.length) return returnData;
		returnData.push(...(responseData.data as IDataObject[]));
		qs.page++;

	} while (responseData.info.more_records !== undefined && responseData.info.more_records === true);

	return returnData;
}


export async function batchUpdate(
	this: IExecuteFunctions | IPollFunctions,
	endpoint: string,
	body: IDataObject,
	updateRecords: IDataObject[],
) {
	if (!updateRecords.length) {
		return { records: [] };
	}

	let responseData: IDataObject;

	if (updateRecords.length && updateRecords.length <= 10) {
		const updateBody = {
			...body,
			records: updateRecords,
		};

		responseData = await apiRequest.call(this, 'PUT', endpoint, updateBody);
		return responseData;
	}

	const batchSize = 10;
	const batches = Math.ceil(updateRecords.length / batchSize);
	const updatedRecords: IDataObject[] = [];

	for (let j = 0; j < batches; j++) {
		const batch = updateRecords.slice(j * batchSize, (j + 1) * batchSize);

		const updateBody = {
			...body,
			records: batch,
		};

		const updateResponse = await apiRequest.call(this, 'PUT', endpoint, updateBody);
		updatedRecords.push(...((updateResponse.records as IDataObject[]) || []));
	}

	responseData = { records: updatedRecords };

	return responseData;
}

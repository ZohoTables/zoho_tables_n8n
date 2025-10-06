import type {
	IDataObject,
	IExecuteFunctions,
	IHookFunctions,
	IPollFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IRequestOptions,
	IWebhookFunctions,
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

async function getDomain(this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions | IHookFunctions | IWebhookFunctions) {
	const credentials = await this.getCredentials('zohotablesOAuth2Api');
	const accessTokenUrl = credentials.accessTokenUrl as string || '';
	let domain = 'zoho.com'; // default
	
	if (accessTokenUrl.includes('zoho.in')) {
		domain = 'zoho.in';
	} else if (accessTokenUrl.includes('zohocloud.ca')) {
		domain = 'zohocloud.ca';
	} else if (accessTokenUrl.includes('zoho.com')) {
		domain = 'zoho.com';
	}

	return domain;
}

export async function apiRequest(
	this: IExecuteFunctions | ILoadOptionsFunctions | IPollFunctions | IWebhookFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	uri?: string,
	option: IDataObject = {},
) {
	query = query || {};

	const domain = await getDomain.call(this);
	const options: IRequestOptions = {
		headers: {},
		method,
		body,
		qs: query,
		uri: uri || `https://tables.${domain}/api/v1/${endpoint}`,
		useQuerystring: false,
		json: true,
	};

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	return await this.helpers.requestOAuth2.call(this, 'zohotablesOAuth2Api', options);
}

export async function apiWebhookRequest(
	this: IExecuteFunctions | IHookFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	endpoint: string,
	body: IDataObject = {},
	query?: IDataObject,
	uri?: string,
	option: IDataObject = {},
) {
	query = query || {};

	const domain = await getDomain.call(this);
	const options: IRequestOptions = {
		headers: {},
		method,
		body,
		qs: query,
		uri: uri || `https://tables.${domain}/wh/v1/${endpoint}`,
		useQuerystring: false,
		json: true,
	};

	if (Object.keys(option).length !== 0) {
		Object.assign(options, option);
	}

	if (Object.keys(body).length === 0) {
		delete options.body;
	}

	return await this.helpers.requestOAuth2.call(this, 'zohotablesOAuth2Api', options);
}

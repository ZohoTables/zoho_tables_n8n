import type {	
	IDataObject,
	IHookFunctions,
	INodeType,
	INodeTypeDescription,
	IWebhookFunctions,
	IWebhookResponseData,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';

import { baseRLC, portalRLC, tableRLC, workspaceRLC } from './V1/actions/common.descriptions';
import { listSearch } from './V1/methods';
import { apiWebhookRequest } from './V1/transport';
import { getAllFieldNames, getRecordWithCriteria } from './V1/methods/listdata';

export class ZohoTablesTrigger implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Zoho Tables Trigger',
		name: 'zohoTablesTrigger',
		icon: 'file:zohotables.svg',
		group: ['trigger'],
		version: 1,
		description: 'Handle Zoho Tables events via webhooks (Beta)',
		defaults: {
			name: 'Zoho Tables Trigger',
		},
		inputs: [],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'zohotablesOAuth2Api',
				required: true,
			},
		],
		webhooks: [
			{
				name: 'default',
				httpMethod: 'POST',
				responseMode: 'onReceived',
				path: 'webhook',
			},
		],
		properties: [
			{
				displayName: 'Trigger',
				name: 'trigger',
				type: 'options',
				required: true,
				default: '',
				options: [
					{
						name: 'record.created',
						value: 'CREATE_RECORD',
					},
					{
						name: 'record.deleted',
						value: 'DELETE_RECORD',
					},
					{
						name: 'record.updated',
						value: 'UPDATE_RECORD',
					},
				],
			},
			{
				...portalRLC,
			},
			{
				...workspaceRLC,
			},
			{
				...baseRLC,
			},
			{
				...tableRLC,
			}
		],
	};

	methods = {
		listSearch
	};

	webhookMethods = {
		default: {
			async checkExists(this: IHookFunctions): Promise<boolean> {
				return false;
			},
			async create(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
                const webhookUrl = this.getNodeWebhookUrl('default');
                const trigger = this.getNodeParameter('trigger') as string;
                const portal = this.getNodeParameter('portal.value') as string;
                const workspace = this.getNodeParameter('workspace.value') as string;
                const base = this.getNodeParameter('base.value') as string;
                const table = this.getNodeParameter('table.value') as string;

                const qs: IDataObject = {
					endpoint_url: webhookUrl,
					name: 'n8n_webhook',
					event_type: trigger,
					scopes: JSON.stringify([`${portal}`, `${workspace}`, `${base}`, `${table}`])
                }
                const responseData = await apiWebhookRequest.call(this, 'POST', 'createWebhook', {}, qs);

                if (responseData === undefined || responseData?.id === undefined) {
                    return false;
                }
                webhookData.webhookId = responseData.id;
                return true;
			},
			async delete(this: IHookFunctions): Promise<boolean> {
				const webhookData = this.getWorkflowStaticData('node');
				try {
					const qs: IDataObject = {
						endpoint_id: webhookData.webhookId as string,
					}
					await apiWebhookRequest.call(this, 'DELETE', 'deleteWebhook', {}, qs);
				} catch (error) {
					return false;
				}
				delete webhookData.webhookId;
				delete webhookData.secret;
				return true;
			},
		},
	};

	async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
		const triggerValue = this.getNodeParameter('trigger', 0) as string;
		console.log('triggerValue', triggerValue);

        const bodyData = this.getBodyData();
		
		switch (triggerValue) {
			case 'CREATE_RECORD': {
				const fields = (await getAllFieldNames.call(this));
				const transformedData: IDataObject = {...bodyData, data: {}}
				for (const key of Object.keys(bodyData.data || {})) {
					const data = bodyData.data as IDataObject;
					if (fields[key]) {
						(transformedData.data as IDataObject)[fields[key]] = data[key];
					} else {
						(transformedData.data as IDataObject)[key] = data[key];
					}
				}
				return {
					workflowData: [this.helpers.returnJsonArray(transformedData)],
				}
			}
			case 'DELETE_RECORD':
				return {
					workflowData: [this.helpers.returnJsonArray(bodyData)],
				};
			case 'UPDATE_RECORD': {
				const recordID = bodyData.recordID as string;
				const [fields, record] = await Promise.all([
					getAllFieldNames.call(this),
					getRecordWithCriteria.call(this, recordID)
				]);
				const transformedData: IDataObject = {...bodyData, data: {}}
				for (const key of Object.keys(record || {})) {
					if (fields[key]) {
						(transformedData.data as IDataObject)[fields[key]] = record[key];
					} else {
						(transformedData.data as IDataObject)[key] = record[key];
					}
				}
				transformedData["updated_fields"] = Object.keys(bodyData.data || {}).map((id) => fields[id]);
				return {
					workflowData: [this.helpers.returnJsonArray(transformedData)],
				};
			}
			default:
				throw new Error('Invalid trigger value: ' + triggerValue);
		}
    }
}

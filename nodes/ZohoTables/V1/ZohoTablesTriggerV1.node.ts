import type {
	IHookFunctions,
	IWebhookFunctions,
	IDataObject,
	INodeType,
	INodeTypeDescription,
	IWebhookResponseData,
	INodeTypeBaseDescription,
} from 'n8n-workflow';
import { NodeConnectionTypes } from 'n8n-workflow';
import { versionDescription } from './actions/versionDescription';
import { baseRLC, portalRLC, tableRLC, workspaceRLC } from './actions/common.descriptions';
import { listSearch } from './methods';
import { apiWebhookRequest } from './transport';
import { getAllFieldNames, getRecordWithCriteria } from './methods/resourceMapping';

export class ZohoTablesTriggerV1 implements INodeType {
	description: INodeTypeDescription;

	constructor(baseDescription: INodeTypeBaseDescription) {
		this.description = {
			...baseDescription,
			...versionDescription,
			defaults: {
				name: 'Zoho Tables Trigger'
			},
			inputs: [],
			outputs: [NodeConnectionTypes.Main],
			credentials: [
				{
					name: 'zohoTablesOAuth2Api',
					required: true,
					displayOptions: {
						show: {
							authentication: ['oAuth2'],
						},
					},
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
					displayName: 'Authentication',
					name: 'authentication',
					type: 'options',
					options: [
						{
							name: 'OAuth2',
							value: 'oAuth2',
						},
					],
					default: 'oAuth2',
				},
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
			usableAsTool: true,
		};
	}

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

	// async webhook(this: IWebhookFunctions): Promise<IWebhookResponseData> {
	// 	const webhookData = this.getWorkflowStaticData('node');
	// 	const headerData = this.getHeaderData() as IDataObject;
	// 	const req = this.getRequestObject();
	// 	const computedSignature = createHmac('sha256', webhookData.secret as string)
	// 		.update(JSON.stringify(req.body))
	// 		.digest('hex');
	// 	if (headerData['x-signature'] !== computedSignature) {
	// 		// Signature is not valid so ignore call
	// 		return {};
	// 	}
	// 	return {
	// 		workflowData: [this.helpers.returnJsonArray(req.body as IDataObject)],
	// 	};
	// }

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

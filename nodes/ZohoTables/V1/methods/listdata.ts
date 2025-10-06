import { IDataObject, IWebhookFunctions } from "n8n-workflow";
import { ztFieldSchema } from "../helpers/interfaces";
import { apiRequest } from "../transport";

export async function getAllFieldNames(this: IWebhookFunctions ): Promise<Record<string, string>> {

	const baseID = this.getNodeParameter('base', undefined, { extractValue: true }) as string;
	const tableID = this.getNodeParameter('table', undefined, { extractValue: true }) as string;
	const fields: Record<string, string> = {};

	if(baseID != "" && baseID != null && tableID != "" && tableID != null){

		const qs = {base_id : baseID, table_id : tableID};
		const response = await apiRequest.call(this, 'GET', 'fields', undefined, qs);

		if(response && response.fields) {
			const fieldData = ((response.fields.fetched as IDataObject[]) || []);
			for (const field of (fieldData as ztFieldSchema[]) || []) {
				fields[field.fieldID] = field.name;
			}
		}
	}

	return fields;
}	

export async function getRecordWithCriteria(this: IWebhookFunctions, recordID: string): Promise<Record<string, string>> {
	const baseID = this.getNodeParameter('base', undefined, { extractValue: true }) as string;
	const tableID = this.getNodeParameter('table', undefined, { extractValue: true }) as string;
	
	const qs = {base_id : baseID, table_id : tableID, record_ids: JSON.stringify([recordID])};
	const response = await apiRequest.call(this, 'GET', 'fetchRecordsWithCriteria', undefined, qs);

	return response.records.fetched.find((record: IDataObject) => record.recordID === recordID).display_data;
} 

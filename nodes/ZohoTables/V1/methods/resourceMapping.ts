import type {
	FieldType,
	IDataObject,
	ILoadOptionsFunctions,
	INodePropertyOptions,
	ResourceMapperField,
	ResourceMapperFields,
} from 'n8n-workflow';

import { apiRequest } from '../transport';

type ztFieldSchema = {
	id:string;
	fieldID: string;
	name: string;
	type: string;
	typeComponents?: IDataObject;
	defaultValue : string;
	visibility? : boolean;
	width? : number;
	options?: IDataObject;
};

type TypesMap = Partial<Record<FieldType, string[]>>;

const supportedFieldTypes = ["23", "4", "24", "13", "21", "6", "15", "16", "19", "18", "9", "17", "7", "30"];

const ztFieldTypeMap = {
	"Attachments"			: "2",
	"Auto-Number"			: "3",
	"CheckBox"				: "4",
	"Created-Time"			: "5",
	"Currency"				: "6",
	"Date-Time"				: "7",
	"Email"					: "9",
	"Formula"				: "10",
	"Modified-Time"			: "12",
	"MultipleSelection"		: "13",
	"Number"				: "15",
	"Percent"				: "16",
	"Phone-Number"			: "17",
	"Collaborator"			: "18",
	"Rating"				: "19",
	"Text"					: "23",
	"Url"					: "24",
	"SingleSelection"		: "21",
	"Created-By"			: "25",
	"Modified-By"			: "26",
	"Lookup"				: "27",
	"Link"					: "30",
	"Rollup"				: "31",
	"Sentimental-Analysis"	: "32",
	"Language-Detection"	: "33",
	"Keyword-Extraction" 	: "34"
}
const ztTypesMap: TypesMap = {
	string: [ztFieldTypeMap["Auto-Number"], ztFieldTypeMap["Email"], ztFieldTypeMap["Phone-Number"], ztFieldTypeMap["Text"], ztFieldTypeMap["Url"], ztFieldTypeMap["Formula"], ztFieldTypeMap["Collaborator"]],
	number: [ztFieldTypeMap["Rating"], ztFieldTypeMap["Percent"], ztFieldTypeMap["Number"], ztFieldTypeMap["Currency"]],
	boolean: [ztFieldTypeMap["CheckBox"]],
	dateTime: [ztFieldTypeMap["Created-Time"], ztFieldTypeMap["Date-Time"], ztFieldTypeMap["Modified-Time"]],
	time: [],
	object: [ztFieldTypeMap["Attachments"]],
	options: [ztFieldTypeMap["SingleSelection"]],
	array: [ztFieldTypeMap["MultipleSelection"]],
};

const ztReadOnlyFields = [
	ztFieldTypeMap["Auto-Number"],
	ztFieldTypeMap["Created-By"],
	ztFieldTypeMap["Created-Time"],
	ztFieldTypeMap["Formula"],
	ztFieldTypeMap["Modified-By"],
	ztFieldTypeMap["Modified-Time"],
	ztFieldTypeMap["Lookup"],
	ztFieldTypeMap["Rollup"],
	ztFieldTypeMap["Link"]
];

function mapForeignType(foreignType: string, typesMap: TypesMap): FieldType {
	let type: FieldType = 'string';

	for (const nativeType of Object.keys(typesMap)) {
		const mappedForeignTypes = typesMap[nativeType as FieldType];
		if (mappedForeignTypes?.includes(foreignType)) {
			type = nativeType as FieldType;
			break;
		}
	}
	return type;
}

export async function getFields(this: ILoadOptionsFunctions): Promise<ResourceMapperFields> {

	const baseID = this.getNodeParameter('base', undefined, { extractValue: true }) as string;
	const tableID = this.getNodeParameter('table', undefined, { extractValue: true }) as string;
	const fields: ResourceMapperField[] = [];

	if(baseID != "" && baseID != null && tableID != "" && tableID != null){

		const qs = {base_id : baseID, table_id : tableID};
		const response = await apiRequest.call(this, 'GET', 'fields', undefined, qs);

		if(response && response.fields) {

			const fieldData = ((response.fields.fetched as IDataObject[]).filter((field: IDataObject) => supportedFieldTypes.includes(field.type as string)) || []);

			let selectionOptions =  [] as IDataObject[];
			if(response.selectionOptions){
				selectionOptions = ((response.selectionOptions.fetched as IDataObject[]) || []);
			}

			const constructOptions = (field: ztFieldSchema) => {

				const typeCode = field.type;
				const isArrayType = ztTypesMap.array?.includes(typeCode) === true;
				const isOptionsType = ztTypesMap.options?.includes(typeCode) === true;

				if (isArrayType || isOptionsType) {

					for (const choice of selectionOptions as IDataObject[]) {

						if(choice.fieldID === field.fieldID){
							const mappedOptions = [];
							for(const option of choice.options as IDataObject[]){
								mappedOptions.push({
									name: option.name,
									value: option.optionID,
								});
							}
							return mappedOptions as INodePropertyOptions[];
						}
					}
				}
				return undefined;
			};

			for (const field of (fieldData as ztFieldSchema[]) || []) {
				const type = mapForeignType(field.type, ztTypesMap);
				const isReadOnly = ztReadOnlyFields.includes(field.type);
				const options = constructOptions(field);

				fields.push({
					id: field.fieldID,
					displayName: field.name,
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
					type,
					options,
					readOnly: isReadOnly
				});
			}
		}
	}

	return { fields };
}

export async function getFieldsWithNames(this: ILoadOptionsFunctions ): Promise<ResourceMapperFields> {

	const baseID = this.getNodeParameter('base', undefined, { extractValue: true }) as string;
	const tableID = this.getNodeParameter('table', undefined, { extractValue: true }) as string;
	const fields: ResourceMapperField[] = [];

	if(baseID != "" && baseID != null && tableID != "" && tableID != null){

		const qs = {base_id : baseID, table_id : tableID};
		const response = await apiRequest.call(this, 'GET', 'fields', undefined, qs);

		if(response && response.fields) {

			const fieldData = ((response.fields.fetched as IDataObject[]).filter((field: IDataObject) => supportedFieldTypes.includes(field.type as string)) || []);

			let selectionOptions =  [] as IDataObject[];
			if(response.selectionOptions){
				selectionOptions = ((response.selectionOptions.fetched as IDataObject[]) || []);
			}

			const constructOptions = (field: ztFieldSchema) => {

				const typeCode = field.type;
				const isArrayType = ztTypesMap.array?.includes(typeCode) === true;
				const isOptionsType = ztTypesMap.options?.includes(typeCode) === true;

				if (isArrayType || isOptionsType) {

					for (const choice of selectionOptions as IDataObject[]) {

						if(choice.fieldID === field.fieldID){
							const mappedOptions = [];
							for(const option of choice.options as IDataObject[]){
								mappedOptions.push({
									name: option.name,
									value: option.optionID,
								});
							}
							return mappedOptions as INodePropertyOptions[];
						}
					}
				}
				return undefined;
			};

			for (const field of (fieldData as ztFieldSchema[]) || []) {
				const type = mapForeignType(field.type, ztTypesMap);
				const isReadOnly = ztReadOnlyFields.includes(field.type);
				const options = constructOptions(field);
				console.log("options : ", options);

				fields.push({
					id: field.name,
					displayName: field.name,
					required: false,
					defaultMatch: false,
					canBeUsedToMatch: true,
					display: true,
					type,
					options,
					readOnly: isReadOnly
				});
			}
		}
	}

	return { fields };
}

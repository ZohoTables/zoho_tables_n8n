import type { IDataObject, FieldType } from 'n8n-workflow';

export interface IAttachment {
	url: string;
	filename: string;
	type: string;
}

export interface IRecord {
	fields: {
		[key: string]: string | IAttachment[];
	};
}

export interface UpdatePayload {
	data: Record<string, string | number | boolean>;
	criteria: string;
}

export type UpdateRecord = {
	fields: IDataObject;
	id?: string;
};
export type UpdateBody = {
	records: UpdateRecord[];
	performUpsert?: {
		fieldsToMergeOn: string[];
	};
	typecast?: boolean;
};

export type ztFieldSchema = {
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

const ztFieldTypeMap = {
	"Attachments"			: "2",
	"Auto-Number"			: "3",
	"CheckBox"				: "4",
	"Created-Time"			: "5",
	"Currency"				: "6",
	"Date-Time"				: "7",
	"Email"					: "9",
	"Modified-Time"			: "12",
	"Number"				: "15",
	"Percent"				: "16",
	"Phone-Number"			: "17",
	"Text"					: "23",
	"Url"					: "24",
	"SingleSelection"		: "21",
	"MultipleSelection"		: "13",
	"Rating"				: "19",
	"Formula"				: "10",
	"Collaborator"			: "18",
	"Created-By"			: "25",
	"Modified-By"			: "26",
	"Link"					: "30",
	"Lookup"				: "27",
	"Rollup"				: "31",
	"Sentimental-Analysis"	: "32",
	"Language-Detection"	: "33",
	"Keyword-Extraction" 	: "34"
}
export const ztTypesMap: TypesMap = {
	string: [ztFieldTypeMap["Auto-Number"], ztFieldTypeMap["Email"], ztFieldTypeMap["Phone-Number"], ztFieldTypeMap["Text"], ztFieldTypeMap["Url"], ztFieldTypeMap["Formula"], ztFieldTypeMap["Collaborator"]],
	number: [ztFieldTypeMap["Rating"], ztFieldTypeMap["Percent"], ztFieldTypeMap["Number"], ztFieldTypeMap["Currency"]],
	boolean: [ztFieldTypeMap["CheckBox"]],
	dateTime: [ztFieldTypeMap["Created-Time"], ztFieldTypeMap["Date-Time"], ztFieldTypeMap["Modified-Time"]],
	time: [],
	object: [ztFieldTypeMap["Attachments"]],
	options: [ztFieldTypeMap["SingleSelection"]],
	array: [ztFieldTypeMap["MultipleSelection"]],
};

export const ztReadOnlyFields = [
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

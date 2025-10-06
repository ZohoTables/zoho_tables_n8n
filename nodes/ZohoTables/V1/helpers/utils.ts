import set from 'lodash/set';
import {
	ApplicationError,
	FieldType,
	INodeExecutionData,
	type IDataObject,
	type NodeApiError,
} from 'n8n-workflow';

import type { UpdateRecord } from './interfaces';

export function removeIgnored(data: IDataObject, ignore: string | string[]) {
	if (ignore) {
		let ignoreFields: string[] = [];

		if (typeof ignore === 'string') {
			ignoreFields = ignore.split(',').map((field) => field.trim());
		} else {
			ignoreFields = ignore;
		}

		const newData: IDataObject = {};

		for (const field of Object.keys(data)) {
			if (!ignoreFields.includes(field)) {
				newData[field] = data[field];
			}
		}

		return newData;
	} else {
		return data;
	}
}

export function findMatches(
	data: UpdateRecord[],
	keys: string[],
	fields: IDataObject,
	updateAll?: boolean,
) {
	if (updateAll) {
		const matches = data.filter((record) => {
			for (const key of keys) {
				if (record.fields[key] !== fields[key]) {
					return false;
				}
			}
			return true;
		});

		if (!matches?.length) {
			throw new ApplicationError('No records match provided keys', { level: 'warning' });
		}

		return matches;
	} else {
		const match = data.find((record) => {
			for (const key of keys) {
				if (record.fields[key] !== fields[key]) {
					return false;
				}
			}
			return true;
		});

		if (!match) {
			throw new ApplicationError('Record matching provided keys was not found', {
				level: 'warning',
			});
		}

		return [match];
	}
}

// helper to sanitize values (avoid quotes, backslash, invalid commas)
export function sanitizeValue(value: string | number | boolean): string | number | boolean {
	if (typeof value === 'string') {
		// Disallow " and \ characters
		if (/["\\]/.test(value)) {
			throw new Error(`Invalid character found in value: ${value}`);
		}
		return value.trim();
	}
	return value;
}

// helper to normalize checkbox values
export function normalizeCheckbox(value: any): string | number | boolean {
	if (['checked', 'true', 1, true].includes(value)) return 1;
	if (['unchecked', 'false', 0, false].includes(value)) return 0;
	return value;
}

// helper to format date
export function formatDate(date: Date): string {
	const pad = (n: number) => (n < 10 ? '0' + n : n);
  return (
    date.getFullYear() +
    '-' +
    pad(date.getMonth() + 1) +
    '-' +
    pad(date.getDate()) +
    '  ' + // <- two spaces
    pad(date.getHours()) +
    ':' +
    pad(date.getMinutes()) +
    ':' +
    pad(date.getSeconds())
  );
}

export function processZohoTablesError(error: NodeApiError, id?: string, itemIndex?: number) {
	if (error.description === 'NOT_FOUND' && id) {
		error.description = `${id} is not a valid Record ID`;
	}
	if (error.description?.includes('You must provide an array of up to 10 record objects') && id) {
		error.description = `${id} is not a valid Record ID`;
	}

	if (itemIndex !== undefined) {
		set(error, 'context.itemIndex', itemIndex);
	}

	return error;
}

export const flattenOutput = (record: IDataObject) => {
	const { fields, ...rest } = record;
	return {
		...rest,
		...(fields as IDataObject),
	};
};

export function wrapData(data: IDataObject | IDataObject[]): INodeExecutionData[] {
	if (!Array.isArray(data)) {
		return [{ json: data }];
	}
	return data.map((item) => ({
		json: item,
	}));
}

type TypesMap = Partial<Record<FieldType, string[]>>;

export function mapForeignType(foreignType: string, typesMap: TypesMap): FieldType {
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

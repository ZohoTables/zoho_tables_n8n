import sortBy from 'lodash/sortBy';
import type {
	IDataObject,
	ILoadOptionsFunctions,
	INodeListSearchResult,
} from 'n8n-workflow';

import { apiRequest } from '../transport';

export async function portalSearch (this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {

	const response = await apiRequest.call(this, 'GET', 'portals');
	const portals = response.portals.fetched.map((portal: IDataObject) => ({
		name: portal.name as string,
		value: portal.portalID as string
	}));

	return { results: sortBy(portals, (o) => o.name) };
}

export async function workspaceSearch (this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {

	const portalID = this.getNodeParameter('portal', undefined, {extractValue: true}) as string;
	const qs = { portal_id: portalID };

	const response = await apiRequest.call(this, 'GET', 'workspaces', undefined, qs);
	const workspaces = response.workspaces.fetched.map((workspace: IDataObject) => ({
		name: workspace.name as string,
		value: workspace.workspaceID as string
	}));

	return { results: sortBy(workspaces, (o) => o.name) };
}

export async function baseSearch (this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {

	const portalID = this.getNodeParameter('portal', undefined, { extractValue: true }) as string;
	const workspaceID = this.getNodeParameter('workspace', undefined, { extractValue: true }) as string;

	const qs = { portal_id: portalID, workspace_id: workspaceID };

	const response = await apiRequest.call(this, 'GET', 'bases', undefined, qs);

	const bases = response.bases.fetched.map((base: IDataObject) => ({
		name: base.name as string,
		value: base.baseID as string,
		url: `https://tables.zoho.com/bas${base.baseID}`,
	}));

	return { results: sortBy(bases, (o) => o.name) };
}

export async function tableSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {

	const baseID = this.getNodeParameter('base', undefined, {
		extractValue: true,
	}) as string;

	const qs = { base_id: baseID };

	const response = await apiRequest.call(this, 'GET', 'tables', undefined, qs);

	const tables = (response.tables.fetched || []).map((table: IDataObject) => ({
		name: table.name as string,
		value: table.tableID as string,
		url: `https://tables.zoho.com/bas${baseID}/tbl${table.tableID}`,

	}))

	return { results: sortBy(tables, (o) => o.name) };

}

export async function viewSearch(this: ILoadOptionsFunctions): Promise<INodeListSearchResult> {

	const baseID = this.getNodeParameter('base', undefined, {extractValue: true}) as string;
	const tableID = this.getNodeParameter('table', undefined, {extractValue: true}) as string;
	const qs = { base_id: baseID, table_id: tableID };

	const response = await apiRequest.call(this, 'GET', 'views', undefined, qs);

	const views = (response.views.fetched || []).map((view: IDataObject) => ({
		name: view.name as string,
		value: view.viewID as string,
		url: `https://tables.zoho.com/bas${baseID}/tbl${tableID}/viw${view.viewID}`,

	}))

	return { results: sortBy(views, (o) => o.name) };
}

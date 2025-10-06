![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# Zoho Tables integration with n8n

This is an n8n community node. It lets you use **Zoho Tables** in your n8n workflows.

**Zoho Tables** is a low-code database management application that helps you create, organize, and manage business data in a collaborative spreadsheet-like interface.

[n8n](https://n8n.io/) is a [fair-code licensed](https://docs.n8n.io/reference/license/) workflow automation platform.

[Installation](#installation)  
[Operations](#operations)  
[Credentials](#credentials)  
[Compatibility](#compatibility)  
[Resources](#resources)  

## Installation

Follow the [installation guide](https://docs.n8n.io/integrations/community-nodes/installation/) in the n8n community nodes documentation.

## Operations

The **Zoho Tables** node supports the following operations:

* **Record:**
    * **Create Record:** Inserts a new row (record) into a specified table.
    * **Delete Record:** Deletes a specific record based on its ID.
    * **Search Record:** Retrieves records from a table based on specified search criteria.
    * **Upsert Record:** Creates a new record if it doesn't exist, or updates it if it does.

## Credentials

To use the **Zoho Tables** node, you will need to authenticate with the Zoho API.

1.  **Prerequisites:** You must have a **Zoho Tables** account.
2.  **Authentication Method:** This node uses **OAuth2** authentication (or **Zoho Tokens** if supported by the n8n core Zoho service integration).
3.  **Setup:**
    * In n8n, when adding a new credential for **Zoho Tables**, select the appropriate Zoho credential type.
    * You will need to set up an **API Client** in your Zoho developer console to get the **Client ID** and **Client Secret**.
    * Ensure your API client has the necessary scopes for **Zoho Tables** (typically scopes related to data access and management).

## Compatibility

This node is generally tested against and is compatible with the latest stable version of **n8n**. A minimum n8n version of **1.0.0** or higher is recommended for full compatibility with community node features.

## Resources

* [n8n community nodes documentation](https://docs.n8n.io/integrations/#community-nodes)
* [Zoho Tables Documentation](https://tables.zoho.com/help/api/v1)
* [Zoho API Documentation (for developers)](https://tables.zoho.com/help/api/v1)

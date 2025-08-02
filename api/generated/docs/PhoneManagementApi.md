# PhoneManagementApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**assignPhone**](#assignphone) | **POST** /phones/{id}/assign | Assign phone to user|
|[**createPhone**](#createphone) | **POST** /phones | Create new phone|
|[**deletePhone**](#deletephone) | **DELETE** /phones/{id} | Delete phone|
|[**getPhoneById**](#getphonebyid) | **GET** /phones/{id} | Get phone by ID|
|[**getPhoneMaintenanceHistory**](#getphonemaintenancehistory) | **GET** /phones/{id}/maintenance-history | Get phone maintenance history|
|[**getPhoneUsageStats**](#getphoneusagestats) | **GET** /phones/{id}/usage-stats | Get phone usage statistics|
|[**getPhones**](#getphones) | **GET** /phones | Get all phones|
|[**requestMaintenance**](#requestmaintenance) | **POST** /phones/{id}/maintenance-request | Request maintenance for a phone|
|[**transferPhone**](#transferphone) | **POST** /phones/{id}/transfer | Transfer phone to another user|
|[**unassignPhone**](#unassignphone) | **POST** /phones/{id}/unassign | Unassign phone from user|
|[**updatePhone**](#updatephone) | **PUT** /phones/{id} | Update phone|

# **assignPhone**
> { [key: string]: object; } assignPhone(requestBody)

Assign a phone to a specific user (Admin/Assigner only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: number; }; //

const { status, data } = await apiInstance.assignPhone(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: number; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **createPhone**
> { [key: string]: object; } createPhone(phoneDto)

Create a new phone (Admin only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration,
    PhoneDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let phoneDto: PhoneDto; //

const { status, data } = await apiInstance.createPhone(
    phoneDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **phoneDto** | **PhoneDto**|  | |


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **deletePhone**
> { [key: string]: object; } deletePhone()

Delete phone (Admin only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deletePhone(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPhoneById**
> { [key: string]: object; } getPhoneById()

Get phone details by ID (Admin/Assigner/Assigned User only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getPhoneById(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPhoneMaintenanceHistory**
> { [key: string]: object; } getPhoneMaintenanceHistory()

Get phone maintenance history by phone ID (Admin/Assigner/Assigned User only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getPhoneMaintenanceHistory(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPhoneUsageStats**
> { [key: string]: object; } getPhoneUsageStats()

Get phone usage statistics by phone ID (Admin/Assigner/Assigned User only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getPhoneUsageStats(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **getPhones**
> { [key: string]: object; } getPhones()

Get all phones with pagination and filtering (Admin/Assigner only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let status: 'AVAILABLE' | 'ASSIGNED' | 'LOST' | 'DAMAGED'; // (optional) (default to undefined)
let brand: string; // (optional) (default to undefined)
let model: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getPhones(
    page,
    limit,
    status,
    brand,
    model
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|
| **status** | [**&#39;AVAILABLE&#39; | &#39;ASSIGNED&#39; | &#39;LOST&#39; | &#39;DAMAGED&#39;**]**Array<&#39;AVAILABLE&#39; &#124; &#39;ASSIGNED&#39; &#124; &#39;LOST&#39; &#124; &#39;DAMAGED&#39;>** |  | (optional) defaults to undefined|
| **brand** | [**string**] |  | (optional) defaults to undefined|
| **model** | [**string**] |  | (optional) defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **requestMaintenance**
> { [key: string]: object; } requestMaintenance(requestBody)

User can request maintenance for their assigned phone

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.requestMaintenance(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: string; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **transferPhone**
> { [key: string]: object; } transferPhone(requestBody)

Transfer a phone from current user to another user (Admin/Assigner only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: number; }; //

const { status, data } = await apiInstance.transferPhone(
    id,
    requestBody
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestBody** | **{ [key: string]: number; }**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **unassignPhone**
> { [key: string]: object; } unassignPhone()

Unassign a phone from its current user (Admin/Assigner only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.unassignPhone(
    id
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: Not defined
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)

# **updatePhone**
> { [key: string]: object; } updatePhone(phoneDto)

Update phone information (Admin only)

### Example

```typescript
import {
    PhoneManagementApi,
    Configuration,
    PhoneDto
} from './api';

const configuration = new Configuration();
const apiInstance = new PhoneManagementApi(configuration);

let id: number; // (default to undefined)
let phoneDto: PhoneDto; //

const { status, data } = await apiInstance.updatePhone(
    id,
    phoneDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **phoneDto** | **PhoneDto**|  | |
| **id** | [**number**] |  | defaults to undefined|


### Return type

**{ [key: string]: object; }**

### Authorization

No authorization required

### HTTP request headers

 - **Content-Type**: application/json
 - **Accept**: */*


### HTTP response details
| Status code | Description | Response headers |
|-------------|-------------|------------------|
|**200** | OK |  -  |

[[Back to top]](#) [[Back to API list]](../README.md#documentation-for-api-endpoints) [[Back to Model list]](../README.md#documentation-for-models) [[Back to README]](../README.md)


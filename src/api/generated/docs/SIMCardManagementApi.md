# SIMCardManagementApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**assignSimCard**](#assignsimcard) | **POST** /simcards/{id}/assign | Assign SIM card to user|
|[**createSimCard**](#createsimcard) | **POST** /simcards | Create new SIM card|
|[**deleteSimCard**](#deletesimcard) | **DELETE** /simcards/{id} | Delete SIM card|
|[**getSimCardById**](#getsimcardbyid) | **GET** /simcards/{id} | Get SIM card by ID|
|[**getSimCards**](#getsimcards) | **GET** /simcards | Get all SIM cards|
|[**transferSimCard**](#transfersimcard) | **POST** /simcards/{id}/transfer | Transfer SIM card to another user|
|[**unassignSimCard**](#unassignsimcard) | **POST** /simcards/{id}/unassign | Unassign SIM card from user|
|[**updateSimCard**](#updatesimcard) | **PUT** /simcards/{id} | Update SIM card|

# **assignSimCard**
> { [key: string]: object; } assignSimCard(requestBody)

Assign a SIM card to a specific user (Admin/Assigner only)

### Example

```typescript
import {
    SIMCardManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SIMCardManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: number; }; //

const { status, data } = await apiInstance.assignSimCard(
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

# **createSimCard**
> { [key: string]: object; } createSimCard(simCardDto)

Create a new SIM card (Admin only)

### Example

```typescript
import {
    SIMCardManagementApi,
    Configuration,
    SimCardDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SIMCardManagementApi(configuration);

let simCardDto: SimCardDto; //

const { status, data } = await apiInstance.createSimCard(
    simCardDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **simCardDto** | **SimCardDto**|  | |


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

# **deleteSimCard**
> { [key: string]: object; } deleteSimCard()

Delete SIM card (Admin only)

### Example

```typescript
import {
    SIMCardManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SIMCardManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteSimCard(
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

# **getSimCardById**
> { [key: string]: object; } getSimCardById()

Get SIM card details by ID (Admin/Assigner/Assigned User only)

### Example

```typescript
import {
    SIMCardManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SIMCardManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getSimCardById(
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

# **getSimCards**
> { [key: string]: object; } getSimCards()

Get all SIM cards with pagination and filtering (Admin/Assigner only)

### Example

```typescript
import {
    SIMCardManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SIMCardManagementApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let status: 'AVAILABLE' | 'ASSIGNED' | 'LOST' | 'BLOCKED'; // (optional) (default to undefined)
let number: string; // (optional) (default to undefined)
let iccid: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getSimCards(
    page,
    limit,
    status,
    number,
    iccid
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|
| **status** | [**&#39;AVAILABLE&#39; | &#39;ASSIGNED&#39; | &#39;LOST&#39; | &#39;BLOCKED&#39;**]**Array<&#39;AVAILABLE&#39; &#124; &#39;ASSIGNED&#39; &#124; &#39;LOST&#39; &#124; &#39;BLOCKED&#39;>** |  | (optional) defaults to undefined|
| **number** | [**string**] |  | (optional) defaults to undefined|
| **iccid** | [**string**] |  | (optional) defaults to undefined|


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

# **transferSimCard**
> { [key: string]: object; } transferSimCard(requestBody)

Transfer a SIM card from current user to another user (Admin/Assigner only)

### Example

```typescript
import {
    SIMCardManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SIMCardManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: number; }; //

const { status, data } = await apiInstance.transferSimCard(
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

# **unassignSimCard**
> { [key: string]: object; } unassignSimCard()

Unassign a SIM card from its current user (Admin/Assigner only)

### Example

```typescript
import {
    SIMCardManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new SIMCardManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.unassignSimCard(
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

# **updateSimCard**
> { [key: string]: object; } updateSimCard(simCardDto)

Update SIM card information (Admin only)

### Example

```typescript
import {
    SIMCardManagementApi,
    Configuration,
    SimCardDto
} from './api';

const configuration = new Configuration();
const apiInstance = new SIMCardManagementApi(configuration);

let id: number; // (default to undefined)
let simCardDto: SimCardDto; //

const { status, data } = await apiInstance.updateSimCard(
    id,
    simCardDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **simCardDto** | **SimCardDto**|  | |
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


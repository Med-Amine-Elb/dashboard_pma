# AttributionManagementApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**createAttribution**](#createattribution) | **POST** /attributions | Create new attribution|
|[**deleteAttribution**](#deleteattribution) | **DELETE** /attributions/{id} | Delete attribution|
|[**getActiveAttributionsByUser**](#getactiveattributionsbyuser) | **GET** /attributions/user/{userId}/active | Get user active attributions|
|[**getAttributionById**](#getattributionbyid) | **GET** /attributions/{id} | Get attribution by ID|
|[**getAttributionHistoryByPhone**](#getattributionhistorybyphone) | **GET** /attributions/history/phone/{phoneId} | Get phone attribution history|
|[**getAttributionHistoryBySimCard**](#getattributionhistorybysimcard) | **GET** /attributions/history/sim/{simCardId} | Get SIM card attribution history|
|[**getAttributions**](#getattributions) | **GET** /attributions | Get all attributions|
|[**returnAttribution**](#returnattribution) | **POST** /attributions/{id}/return | Return attribution|
|[**updateAttribution**](#updateattribution) | **PUT** /attributions/{id} | Update attribution|

# **createAttribution**
> { [key: string]: object; } createAttribution(attributionDto)

Create a new attribution (Admin/Assigner only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration,
    AttributionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let attributionDto: AttributionDto; //

const { status, data } = await apiInstance.createAttribution(
    attributionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **attributionDto** | **AttributionDto**|  | |


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

# **deleteAttribution**
> { [key: string]: object; } deleteAttribution()

Delete attribution (Admin only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteAttribution(
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

# **getActiveAttributionsByUser**
> { [key: string]: object; } getActiveAttributionsByUser()

Get active attributions for a specific user (Admin/Assigner only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getActiveAttributionsByUser(
    userId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **userId** | [**number**] |  | defaults to undefined|


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

# **getAttributionById**
> { [key: string]: object; } getAttributionById()

Get attribution details by ID (Admin/Assigner only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getAttributionById(
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

# **getAttributionHistoryByPhone**
> { [key: string]: object; } getAttributionHistoryByPhone()

Get attribution history for a specific phone (Admin/Assigner only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let phoneId: number; // (default to undefined)

const { status, data } = await apiInstance.getAttributionHistoryByPhone(
    phoneId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **phoneId** | [**number**] |  | defaults to undefined|


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

# **getAttributionHistoryBySimCard**
> { [key: string]: object; } getAttributionHistoryBySimCard()

Get attribution history for a specific SIM card (Admin/Assigner only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let simCardId: number; // (default to undefined)

const { status, data } = await apiInstance.getAttributionHistoryBySimCard(
    simCardId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **simCardId** | [**number**] |  | defaults to undefined|


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

# **getAttributions**
> { [key: string]: object; } getAttributions()

Get all attributions with pagination and filtering (Admin/Assigner only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let status: 'ACTIVE' | 'PENDING' | 'RETURNED'; // (optional) (default to undefined)
let userId: number; // (optional) (default to undefined)
let assignedBy: number; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getAttributions(
    page,
    limit,
    status,
    userId,
    assignedBy,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|
| **status** | [**&#39;ACTIVE&#39; | &#39;PENDING&#39; | &#39;RETURNED&#39;**]**Array<&#39;ACTIVE&#39; &#124; &#39;PENDING&#39; &#124; &#39;RETURNED&#39;>** |  | (optional) defaults to undefined|
| **userId** | [**number**] |  | (optional) defaults to undefined|
| **assignedBy** | [**number**] |  | (optional) defaults to undefined|
| **search** | [**string**] |  | (optional) defaults to undefined|


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

# **returnAttribution**
> { [key: string]: object; } returnAttribution()

Mark attribution as returned (Admin/Assigner only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.returnAttribution(
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

# **updateAttribution**
> { [key: string]: object; } updateAttribution(attributionDto)

Update attribution information (Admin/Assigner only)

### Example

```typescript
import {
    AttributionManagementApi,
    Configuration,
    AttributionDto
} from './api';

const configuration = new Configuration();
const apiInstance = new AttributionManagementApi(configuration);

let id: number; // (default to undefined)
let attributionDto: AttributionDto; //

const { status, data } = await apiInstance.updateAttribution(
    id,
    attributionDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **attributionDto** | **AttributionDto**|  | |
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


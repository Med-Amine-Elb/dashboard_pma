# RequestManagementApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**addComment**](#addcomment) | **POST** /requests/{id}/comments | Add comment to request|
|[**assignRequest**](#assignrequest) | **POST** /requests/{id}/assign | Assign request|
|[**createRequest**](#createrequest) | **POST** /requests | Create new request|
|[**deleteRequest**](#deleterequest) | **DELETE** /requests/{id} | Delete request|
|[**getPendingRequests**](#getpendingrequests) | **GET** /requests/pending | Get pending requests|
|[**getRequestById**](#getrequestbyid) | **GET** /requests/{id} | Get request by ID|
|[**getRequests**](#getrequests) | **GET** /requests | Get all requests|
|[**getRequestsByUser**](#getrequestsbyuser) | **GET** /requests/user/{userId} | Get user requests|
|[**getUrgentRequests**](#geturgentrequests) | **GET** /requests/urgent | Get urgent requests|
|[**rejectRequest**](#rejectrequest) | **POST** /requests/{id}/reject | Reject request|
|[**resolveRequest**](#resolverequest) | **POST** /requests/{id}/resolve | Resolve request|
|[**updateRequest**](#updaterequest) | **PUT** /requests/{id} | Update request|

# **addComment**
> { [key: string]: object; } addComment(requestBody)

Add a comment to a request (Admin/Assigner only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.addComment(
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

# **assignRequest**
> { [key: string]: object; } assignRequest(requestBody)

Assign a request to a user (Admin/Assigner only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: number; }; //

const { status, data } = await apiInstance.assignRequest(
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

# **createRequest**
> { [key: string]: object; } createRequest(requestDto)

Create a new request

### Example

```typescript
import {
    RequestManagementApi,
    Configuration,
    RequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let requestDto: RequestDto; //

const { status, data } = await apiInstance.createRequest(
    requestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestDto** | **RequestDto**|  | |


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

# **deleteRequest**
> { [key: string]: object; } deleteRequest()

Delete request (Admin only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.deleteRequest(
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

# **getPendingRequests**
> { [key: string]: object; } getPendingRequests()

Get all pending requests (Admin/Assigner only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

const { status, data } = await apiInstance.getPendingRequests();
```

### Parameters
This endpoint does not have any parameters.


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

# **getRequestById**
> { [key: string]: object; } getRequestById()

Get request details by ID

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let id: number; // (default to undefined)

const { status, data } = await apiInstance.getRequestById(
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

# **getRequests**
> { [key: string]: object; } getRequests()

Get all requests with pagination and filtering (Admin/Assigner only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let page: number; // (optional) (default to 1)
let limit: number; // (optional) (default to 10)
let status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED' | 'RESOLVED'; // (optional) (default to undefined)
let type: 'PROBLEM' | 'REPLACEMENT' | 'SUPPORT' | 'CHANGE'; // (optional) (default to undefined)
let priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'; // (optional) (default to undefined)
let userId: number; // (optional) (default to undefined)
let assignedTo: number; // (optional) (default to undefined)
let search: string; // (optional) (default to undefined)

const { status, data } = await apiInstance.getRequests(
    page,
    limit,
    status,
    type,
    priority,
    userId,
    assignedTo,
    search
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **page** | [**number**] |  | (optional) defaults to 1|
| **limit** | [**number**] |  | (optional) defaults to 10|
| **status** | [**&#39;PENDING&#39; | &#39;IN_PROGRESS&#39; | &#39;APPROVED&#39; | &#39;REJECTED&#39; | &#39;RESOLVED&#39;**]**Array<&#39;PENDING&#39; &#124; &#39;IN_PROGRESS&#39; &#124; &#39;APPROVED&#39; &#124; &#39;REJECTED&#39; &#124; &#39;RESOLVED&#39;>** |  | (optional) defaults to undefined|
| **type** | [**&#39;PROBLEM&#39; | &#39;REPLACEMENT&#39; | &#39;SUPPORT&#39; | &#39;CHANGE&#39;**]**Array<&#39;PROBLEM&#39; &#124; &#39;REPLACEMENT&#39; &#124; &#39;SUPPORT&#39; &#124; &#39;CHANGE&#39;>** |  | (optional) defaults to undefined|
| **priority** | [**&#39;LOW&#39; | &#39;NORMAL&#39; | &#39;HIGH&#39; | &#39;URGENT&#39;**]**Array<&#39;LOW&#39; &#124; &#39;NORMAL&#39; &#124; &#39;HIGH&#39; &#124; &#39;URGENT&#39;>** |  | (optional) defaults to undefined|
| **userId** | [**number**] |  | (optional) defaults to undefined|
| **assignedTo** | [**number**] |  | (optional) defaults to undefined|
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

# **getRequestsByUser**
> { [key: string]: object; } getRequestsByUser()

Get all requests for a specific user

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getRequestsByUser(
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

# **getUrgentRequests**
> { [key: string]: object; } getUrgentRequests()

Get all urgent requests (Admin/Assigner only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

const { status, data } = await apiInstance.getUrgentRequests();
```

### Parameters
This endpoint does not have any parameters.


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

# **rejectRequest**
> { [key: string]: object; } rejectRequest(requestBody)

Reject a request (Admin/Assigner only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.rejectRequest(
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

# **resolveRequest**
> { [key: string]: object; } resolveRequest(requestBody)

Mark a request as resolved (Admin/Assigner only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let id: number; // (default to undefined)
let requestBody: { [key: string]: string; }; //

const { status, data } = await apiInstance.resolveRequest(
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

# **updateRequest**
> { [key: string]: object; } updateRequest(requestDto)

Update request information (Admin/Assigner only)

### Example

```typescript
import {
    RequestManagementApi,
    Configuration,
    RequestDto
} from './api';

const configuration = new Configuration();
const apiInstance = new RequestManagementApi(configuration);

let id: number; // (default to undefined)
let requestDto: RequestDto; //

const { status, data } = await apiInstance.updateRequest(
    id,
    requestDto
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **requestDto** | **RequestDto**|  | |
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


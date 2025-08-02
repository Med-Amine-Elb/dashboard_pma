# ExportControllerApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**exportAttributions**](#exportattributions) | **GET** /export/attributions | |
|[**exportAuditLogs**](#exportauditlogs) | **GET** /export/audit-logs | |
|[**exportPhones**](#exportphones) | **GET** /export/phones | |
|[**exportRequests**](#exportrequests) | **GET** /export/requests | |
|[**exportSimCards**](#exportsimcards) | **GET** /export/simcards | |
|[**exportUsers**](#exportusers) | **GET** /export/users | |

# **exportAttributions**
> File exportAttributions()


### Example

```typescript
import {
    ExportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExportControllerApi(configuration);

let format: string; // (optional) (default to 'csv')

const { status, data } = await apiInstance.exportAttributions(
    format
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **format** | [**string**] |  | (optional) defaults to 'csv'|


### Return type

**File**

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

# **exportAuditLogs**
> File exportAuditLogs()


### Example

```typescript
import {
    ExportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExportControllerApi(configuration);

const { status, data } = await apiInstance.exportAuditLogs();
```

### Parameters
This endpoint does not have any parameters.


### Return type

**File**

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

# **exportPhones**
> File exportPhones()


### Example

```typescript
import {
    ExportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExportControllerApi(configuration);

let format: string; // (optional) (default to 'csv')

const { status, data } = await apiInstance.exportPhones(
    format
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **format** | [**string**] |  | (optional) defaults to 'csv'|


### Return type

**File**

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

# **exportRequests**
> File exportRequests()


### Example

```typescript
import {
    ExportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExportControllerApi(configuration);

let format: string; // (optional) (default to 'csv')

const { status, data } = await apiInstance.exportRequests(
    format
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **format** | [**string**] |  | (optional) defaults to 'csv'|


### Return type

**File**

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

# **exportSimCards**
> File exportSimCards()


### Example

```typescript
import {
    ExportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExportControllerApi(configuration);

let format: string; // (optional) (default to 'csv')

const { status, data } = await apiInstance.exportSimCards(
    format
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **format** | [**string**] |  | (optional) defaults to 'csv'|


### Return type

**File**

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

# **exportUsers**
> File exportUsers()


### Example

```typescript
import {
    ExportControllerApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new ExportControllerApi(configuration);

let format: string; // (optional) (default to 'csv')

const { status, data } = await apiInstance.exportUsers(
    format
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **format** | [**string**] |  | (optional) defaults to 'csv'|


### Return type

**File**

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


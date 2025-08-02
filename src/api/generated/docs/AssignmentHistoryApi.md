# AssignmentHistoryApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getPhoneHistory**](#getphonehistory) | **GET** /assignment-history/phone/{phoneId} | Get phone assignment history|
|[**getSimHistory**](#getsimhistory) | **GET** /assignment-history/sim/{simId} | Get SIM card assignment history|
|[**getUserHistory**](#getuserhistory) | **GET** /assignment-history/user/{userId} | Get user assignment history|

# **getPhoneHistory**
> { [key: string]: object; } getPhoneHistory()

Get assignment/transfer history for a phone

### Example

```typescript
import {
    AssignmentHistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AssignmentHistoryApi(configuration);

let phoneId: number; // (default to undefined)

const { status, data } = await apiInstance.getPhoneHistory(
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

# **getSimHistory**
> { [key: string]: object; } getSimHistory()

Get assignment/transfer history for a SIM card

### Example

```typescript
import {
    AssignmentHistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AssignmentHistoryApi(configuration);

let simId: number; // (default to undefined)

const { status, data } = await apiInstance.getSimHistory(
    simId
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **simId** | [**number**] |  | defaults to undefined|


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

# **getUserHistory**
> { [key: string]: object; } getUserHistory()

Get assignment/transfer history for a user

### Example

```typescript
import {
    AssignmentHistoryApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new AssignmentHistoryApi(configuration);

let userId: number; // (default to undefined)

const { status, data } = await apiInstance.getUserHistory(
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


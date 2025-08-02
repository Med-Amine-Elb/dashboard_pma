# DashboardReportingApi

All URIs are relative to *http://localhost:8080/api*

|Method | HTTP request | Description|
|------------- | ------------- | -------------|
|[**getAlerts**](#getalerts) | **GET** /dashboard/alerts | Get system alerts|
|[**getDashboardOverview**](#getdashboardoverview) | **GET** /dashboard/overview | Get dashboard overview|
|[**getPhoneStats**](#getphonestats) | **GET** /dashboard/phones/stats | Get phone statistics|
|[**getRecentActivity**](#getrecentactivity) | **GET** /dashboard/recent-activity | Get recent activity|
|[**getSimCardStats**](#getsimcardstats) | **GET** /dashboard/simcards/stats | Get SIM card statistics|
|[**getUserStats**](#getuserstats) | **GET** /dashboard/users/stats | Get user statistics|

# **getAlerts**
> { [key: string]: object; } getAlerts()

Get items needing attention (Admin/Assigner only)

### Example

```typescript
import {
    DashboardReportingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardReportingApi(configuration);

const { status, data } = await apiInstance.getAlerts();
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

# **getDashboardOverview**
> { [key: string]: object; } getDashboardOverview()

Get overall statistics for dashboard (Admin/Assigner only)

### Example

```typescript
import {
    DashboardReportingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardReportingApi(configuration);

const { status, data } = await apiInstance.getDashboardOverview();
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

# **getPhoneStats**
> { [key: string]: object; } getPhoneStats()

Get detailed phone statistics (Admin/Assigner only)

### Example

```typescript
import {
    DashboardReportingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardReportingApi(configuration);

const { status, data } = await apiInstance.getPhoneStats();
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

# **getRecentActivity**
> { [key: string]: object; } getRecentActivity()

Get recent assignments, transfers, and activities (Admin/Assigner only)

### Example

```typescript
import {
    DashboardReportingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardReportingApi(configuration);

let limit: number; // (optional) (default to 10)

const { status, data } = await apiInstance.getRecentActivity(
    limit
);
```

### Parameters

|Name | Type | Description  | Notes|
|------------- | ------------- | ------------- | -------------|
| **limit** | [**number**] |  | (optional) defaults to 10|


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

# **getSimCardStats**
> { [key: string]: object; } getSimCardStats()

Get detailed SIM card statistics (Admin/Assigner only)

### Example

```typescript
import {
    DashboardReportingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardReportingApi(configuration);

const { status, data } = await apiInstance.getSimCardStats();
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

# **getUserStats**
> { [key: string]: object; } getUserStats()

Get user statistics and distribution (Admin/Assigner only)

### Example

```typescript
import {
    DashboardReportingApi,
    Configuration
} from './api';

const configuration = new Configuration();
const apiInstance = new DashboardReportingApi(configuration);

const { status, data } = await apiInstance.getUserStats();
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

